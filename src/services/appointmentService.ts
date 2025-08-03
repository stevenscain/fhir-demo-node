import { v4 as uuidv4 } from 'uuid';
import { differenceInMinutes, parseISO } from 'date-fns';
import { FHIRAppointment, AppointmentCreateRequest, AppointmentResponse, AppointmentUpdateRequest, PEDIATRIC_APPOINTMENT_TYPES, PEDIATRIC_SPECIALTIES } from '../models/Appointment';
import { patientService } from './patientService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface AppointmentStore {
  [id: string]: FHIRAppointment;
}

class AppointmentService {
  private appointments: AppointmentStore = {};

  async createAppointment(appointmentData: AppointmentCreateRequest): Promise<AppointmentResponse> {
    try {
      const patient = patientService.getFHIRPatient(appointmentData.patientId);
      
      const appointmentId = uuidv4();
      const now = new Date().toISOString();
      const duration = differenceInMinutes(parseISO(appointmentData.endDateTime), parseISO(appointmentData.startDateTime));

      const fhirAppointment: FHIRAppointment = {
        resourceType: 'Appointment',
        id: appointmentId,
        meta: {
          versionId: '1',
          lastUpdated: now,
          profile: ['http://hl7.org/fhir/StructureDefinition/Appointment']
        },
        identifier: [{
          use: 'usual',
          system: 'http://example.org/fhir/sid/appointment-id',
          value: `APT-${appointmentId.substring(0, 8)}`
        }],
        status: 'booked',
        serviceCategory: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/service-category',
            code: 'pediatric',
            display: 'Pediatric Care'
          }]
        }],
        serviceType: [{
          coding: [{
            system: 'http://example.org/fhir/CodeSystem/appointment-types',
            code: appointmentData.appointmentType,
            display: PEDIATRIC_APPOINTMENT_TYPES[appointmentData.appointmentType.toUpperCase().replace('-', '_') as keyof typeof PEDIATRIC_APPOINTMENT_TYPES]?.display || appointmentData.appointmentType
          }]
        }],
        specialty: appointmentData.specialty ? [{
          coding: [{
            system: 'http://snomed.info/sct',
            code: appointmentData.specialty,
            display: PEDIATRIC_SPECIALTIES[appointmentData.specialty.toUpperCase().replace('-', '_') as keyof typeof PEDIATRIC_SPECIALTIES]?.display || appointmentData.specialty
          }]
        }] : undefined,
        appointmentType: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
            code: this.mapPriorityToCode(appointmentData.priority),
            display: appointmentData.priority
          }]
        },
        reasonCode: appointmentData.reasonForVisit ? [{
          text: appointmentData.reasonForVisit
        }] : undefined,
        priority: this.mapPriorityToNumber(appointmentData.priority),
        description: appointmentData.description,
        start: appointmentData.startDateTime,
        end: appointmentData.endDateTime,
        minutesDuration: duration,
        created: now,
        comment: [
          ...(appointmentData.notes ? [appointmentData.notes] : []),
          ...(appointmentData.telehealth ? ['Telehealth appointment'] : []),
          ...(appointmentData.location ? [`Location: ${appointmentData.location}`] : [])
        ].join('; ') || undefined,
        participant: [
          {
            type: [{
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'PPRF',
                display: 'primary performer'
              }]
            }],
            actor: {
              reference: `Patient/${appointmentData.patientId}`,
              display: `${patient.name?.[0]?.given?.[0]} ${patient.name?.[0]?.family}`
            },
            required: 'required',
            status: 'accepted'
          },
          ...(appointmentData.providerId ? [{
            type: [{
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'ATND',
                display: 'attender'
              }]
            }],
            actor: {
              reference: `Practitioner/${appointmentData.providerId}`,
              display: 'Healthcare Provider'
            },
            required: 'required' as const,
            status: 'accepted' as const
          }] : [])
        ]
      };

      this.appointments[appointmentId] = fhirAppointment;

      logger.info('Appointment created successfully', { 
        appointmentId, 
        patientId: appointmentData.patientId,
        type: appointmentData.appointmentType,
        startDateTime: appointmentData.startDateTime 
      });

      return this.mapToAppointmentResponse(fhirAppointment);
    } catch (error) {
      logger.error('Error creating appointment', { error: error.message, appointmentData });
      throw new AppError('Failed to create appointment', 500);
    }
  }

  async getAppointmentById(appointmentId: string): Promise<AppointmentResponse> {
    const appointment = this.appointments[appointmentId];
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    return this.mapToAppointmentResponse(appointment);
  }

  async getAppointmentsByPatient(patientId: string, status?: string): Promise<AppointmentResponse[]> {
    const appointments = Object.values(this.appointments).filter(apt => {
      const patientParticipant = apt.participant.find(p => 
        p.actor?.reference === `Patient/${patientId}`
      );
      const matchesPatient = !!patientParticipant;
      
      if (!status) return matchesPatient;
      return matchesPatient && apt.status === status;
    });

    return appointments
      .sort((a, b) => new Date(a.start || '').getTime() - new Date(b.start || '').getTime())
      .map(apt => this.mapToAppointmentResponse(apt));
  }

  async getUpcomingAppointments(patientId?: string): Promise<AppointmentResponse[]> {
    const now = new Date();
    const appointments = Object.values(this.appointments).filter(apt => {
      const isUpcoming = new Date(apt.start || '') > now;
      const isNotCancelled = apt.status !== 'cancelled' && apt.status !== 'noshow';
      
      if (!patientId) return isUpcoming && isNotCancelled;
      
      const patientParticipant = apt.participant.find(p => 
        p.actor?.reference === `Patient/${patientId}`
      );
      return isUpcoming && isNotCancelled && !!patientParticipant;
    });

    return appointments
      .sort((a, b) => new Date(a.start || '').getTime() - new Date(b.start || '').getTime())
      .map(apt => this.mapToAppointmentResponse(apt));
  }

  async updateAppointment(appointmentId: string, updates: AppointmentUpdateRequest): Promise<AppointmentResponse> {
    const existingAppointment = this.appointments[appointmentId];
    if (!existingAppointment) {
      throw new AppError('Appointment not found', 404);
    }

    try {
      const now = new Date().toISOString();
      let duration = existingAppointment.minutesDuration;
      
      if (updates.startDateTime || updates.endDateTime) {
        const startDateTime = updates.startDateTime || existingAppointment.start || '';
        const endDateTime = updates.endDateTime || existingAppointment.end || '';
        duration = differenceInMinutes(parseISO(endDateTime), parseISO(startDateTime));
      }

      const updatedAppointment: FHIRAppointment = {
        ...existingAppointment,
        meta: {
          ...existingAppointment.meta,
          versionId: (parseInt(existingAppointment.meta?.versionId || '1') + 1).toString(),
          lastUpdated: now
        },
        status: updates.status || existingAppointment.status,
        start: updates.startDateTime || existingAppointment.start,
        end: updates.endDateTime || existingAppointment.end,
        minutesDuration: duration,
        cancelationReason: updates.cancelationReason ? {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/appointment-cancellation-reason',
            code: 'pat',
            display: updates.cancelationReason
          }]
        } : existingAppointment.cancelationReason,
        comment: [
          existingAppointment.comment,
          updates.notes,
          updates.location ? `Updated location: ${updates.location}` : undefined
        ].filter(Boolean).join('; ') || undefined,
        participant: updates.providerId ? 
          existingAppointment.participant.map(p => 
            p.actor?.reference?.startsWith('Practitioner/') ? 
              { ...p, actor: { ...p.actor, reference: `Practitioner/${updates.providerId}` } } : 
              p
          ) : existingAppointment.participant
      };

      this.appointments[appointmentId] = updatedAppointment;

      logger.info('Appointment updated successfully', { appointmentId, updates });

      return this.mapToAppointmentResponse(updatedAppointment);
    } catch (error) {
      logger.error('Error updating appointment', { error: error.message, appointmentId, updates });
      throw new AppError('Failed to update appointment', 500);
    }
  }

  async cancelAppointment(appointmentId: string, reason: string): Promise<AppointmentResponse> {
    return this.updateAppointment(appointmentId, {
      status: 'cancelled',
      cancelationReason: reason
    });
  }

  async checkInAppointment(appointmentId: string): Promise<AppointmentResponse> {
    return this.updateAppointment(appointmentId, {
      status: 'checked-in'
    });
  }

  async completeAppointment(appointmentId: string, notes?: string): Promise<AppointmentResponse> {
    return this.updateAppointment(appointmentId, {
      status: 'fulfilled',
      notes
    });
  }

  async deleteAppointment(appointmentId: string): Promise<void> {
    if (!this.appointments[appointmentId]) {
      throw new AppError('Appointment not found', 404);
    }

    delete this.appointments[appointmentId];
    logger.info('Appointment deleted successfully', { appointmentId });
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string, patientId?: string): Promise<AppointmentResponse[]> {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    const appointments = Object.values(this.appointments).filter(apt => {
      const aptDate = parseISO(apt.start || '');
      const inRange = aptDate >= start && aptDate <= end;
      
      if (!patientId) return inRange;
      
      const patientParticipant = apt.participant.find(p => 
        p.actor?.reference === `Patient/${patientId}`
      );
      return inRange && !!patientParticipant;
    });

    return appointments
      .sort((a, b) => new Date(a.start || '').getTime() - new Date(b.start || '').getTime())
      .map(apt => this.mapToAppointmentResponse(apt));
  }

  private mapPriorityToCode(priority: string): string {
    const mapping: { [key: string]: string } = {
      'routine': 'R',
      'urgent': 'U',
      'asap': 'A',
      'stat': 'S'
    };
    return mapping[priority] || 'R';
  }

  private mapPriorityToNumber(priority: string): number {
    const mapping: { [key: string]: number } = {
      'routine': 5,
      'urgent': 3,
      'asap': 2,
      'stat': 1
    };
    return mapping[priority] || 5;
  }

  private mapToAppointmentResponse(fhirAppointment: FHIRAppointment): AppointmentResponse {
    const patientParticipant = fhirAppointment.participant.find(p => 
      p.actor?.reference?.startsWith('Patient/')
    );
    const providerParticipant = fhirAppointment.participant.find(p => 
      p.actor?.reference?.startsWith('Practitioner/')
    );

    const patientId = patientParticipant?.actor?.reference?.replace('Patient/', '') || '';
    const providerId = providerParticipant?.actor?.reference?.replace('Practitioner/', '');

    const appointmentTypeCode = fhirAppointment.serviceType?.[0]?.coding?.[0]?.code || '';
    const specialtyCode = fhirAppointment.specialty?.[0]?.coding?.[0]?.code;
    
    const priorityCode = fhirAppointment.appointmentType?.coding?.[0]?.code || 'R';
    const priorityMapping: { [key: string]: string } = {
      'R': 'routine',
      'U': 'urgent',
      'A': 'asap',
      'S': 'stat'
    };

    const isTelehealth = fhirAppointment.comment?.includes('Telehealth') || false;
    const locationMatch = fhirAppointment.comment?.match(/Location: ([^;]+)/);
    const location = locationMatch ? locationMatch[1] : undefined;

    return {
      id: fhirAppointment.id || '',
      patientId,
      patientName: patientParticipant?.actor?.display || '',
      providerId,
      providerName: providerParticipant?.actor?.display,
      appointmentType: appointmentTypeCode,
      specialty: specialtyCode,
      status: fhirAppointment.status,
      startDateTime: fhirAppointment.start || '',
      endDateTime: fhirAppointment.end || '',
      duration: fhirAppointment.minutesDuration || 0,
      priority: priorityMapping[priorityCode] || 'routine',
      description: fhirAppointment.description,
      reasonForVisit: fhirAppointment.reasonCode?.[0]?.text,
      location,
      telehealth: isTelehealth,
      notes: fhirAppointment.comment,
      createdAt: fhirAppointment.created || fhirAppointment.meta?.lastUpdated || new Date().toISOString(),
      updatedAt: fhirAppointment.meta?.lastUpdated || new Date().toISOString()
    };
  }
}

export const appointmentService = new AppointmentService();