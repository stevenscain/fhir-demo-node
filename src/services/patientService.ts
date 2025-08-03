import { v4 as uuidv4 } from 'uuid';
import { differenceInYears, parseISO } from 'date-fns';
import { FHIRPatient, PediatricPatient, PatientCreateRequest, PatientResponse } from '../models/Patient';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface PatientStore {
  [id: string]: PediatricPatient;
}

class PatientService {
  private patients: PatientStore = {};

  async createPatient(patientData: PatientCreateRequest): Promise<PatientResponse> {
    try {
      const patientId = uuidv4();
      const now = new Date().toISOString();

      const fhirPatient: PediatricPatient = {
        resourceType: 'Patient',
        id: patientId,
        meta: {
          versionId: '1',
          lastUpdated: now,
          profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient']
        },
        identifier: [
          {
            use: 'usual',
            type: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'MR',
                display: 'Medical Record Number'
              }]
            },
            system: 'http://example.org/fhir/sid/us-mrn',
            value: patientData.medicalRecordNumber || `MRN-${patientId.substring(0, 8)}`
          }
        ],
        active: true,
        name: [{
          use: 'official',
          family: patientData.lastName,
          given: [patientData.firstName]
        }],
        telecom: [
          ...(patientData.email ? [{
            system: 'email' as const,
            value: patientData.email,
            use: 'home' as const
          }] : []),
          ...(patientData.phone ? [{
            system: 'phone' as const,
            value: patientData.phone,
            use: 'home' as const
          }] : [])
        ],
        gender: patientData.gender,
        birthDate: patientData.dateOfBirth,
        address: patientData.address ? [{
          use: 'home',
          type: 'both',
          line: [patientData.address.line1, ...(patientData.address.line2 ? [patientData.address.line2] : [])],
          city: patientData.address.city,
          state: patientData.address.state,
          postalCode: patientData.address.postalCode,
          country: patientData.address.country || 'US'
        }] : undefined,
        contact: patientData.emergencyContact ? [{
          relationship: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
              code: 'C',
              display: patientData.emergencyContact.relationship
            }]
          }],
          name: {
            family: patientData.emergencyContact.name.split(' ').pop() || '',
            given: patientData.emergencyContact.name.split(' ').slice(0, -1)
          },
          telecom: [{
            system: 'phone',
            value: patientData.emergencyContact.phone,
            use: 'home'
          }]
        }] : undefined,
        extension: [
          {
            url: 'http://example.org/fhir/StructureDefinition/pediatric-care-complexity',
            valueCode: patientData.careComplexity || 'low'
          },
          {
            url: 'http://example.org/fhir/StructureDefinition/primary-caregiver',
            valueString: patientData.emergencyContact?.name || 'Not specified'
          }
        ]
      };

      this.patients[patientId] = fhirPatient;

      logger.info('Patient created successfully', { patientId, name: `${patientData.firstName} ${patientData.lastName}` });

      return this.mapToPatientResponse(fhirPatient);
    } catch (error) {
      logger.error('Error creating patient', { error: error.message, patientData });
      throw new AppError('Failed to create patient', 500);
    }
  }

  async getPatientById(patientId: string): Promise<PatientResponse> {
    const patient = this.patients[patientId];
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return this.mapToPatientResponse(patient);
  }

  async updatePatient(patientId: string, updates: Partial<PatientCreateRequest>): Promise<PatientResponse> {
    const existingPatient = this.patients[patientId];
    if (!existingPatient) {
      throw new AppError('Patient not found', 404);
    }

    try {
      const now = new Date().toISOString();
      const updatedPatient: PediatricPatient = {
        ...existingPatient,
        meta: {
          ...existingPatient.meta,
          versionId: (parseInt(existingPatient.meta?.versionId || '1') + 1).toString(),
          lastUpdated: now
        }
      };

      if (updates.firstName || updates.lastName) {
        updatedPatient.name = [{
          use: 'official',
          family: updates.lastName || existingPatient.name?.[0]?.family || '',
          given: [updates.firstName || existingPatient.name?.[0]?.given?.[0] || '']
        }];
      }

      if (updates.email !== undefined || updates.phone !== undefined) {
        updatedPatient.telecom = [
          ...(updates.email ? [{
            system: 'email' as const,
            value: updates.email,
            use: 'home' as const
          }] : existingPatient.telecom?.filter(t => t.system !== 'email') || []),
          ...(updates.phone ? [{
            system: 'phone' as const,
            value: updates.phone,
            use: 'home' as const
          }] : existingPatient.telecom?.filter(t => t.system !== 'phone') || [])
        ];
      }

      if (updates.address) {
        updatedPatient.address = [{
          use: 'home',
          type: 'both',
          line: [updates.address.line1, ...(updates.address.line2 ? [updates.address.line2] : [])],
          city: updates.address.city,
          state: updates.address.state,
          postalCode: updates.address.postalCode,
          country: updates.address.country || 'US'
        }];
      }

      if (updates.careComplexity) {
        const complexityExtension = updatedPatient.extension?.find(
          ext => ext.url === 'http://example.org/fhir/StructureDefinition/pediatric-care-complexity'
        );
        if (complexityExtension) {
          complexityExtension.valueCode = updates.careComplexity;
        }
      }

      this.patients[patientId] = updatedPatient;

      logger.info('Patient updated successfully', { patientId });

      return this.mapToPatientResponse(updatedPatient);
    } catch (error) {
      logger.error('Error updating patient', { error: error.message, patientId, updates });
      throw new AppError('Failed to update patient', 500);
    }
  }

  async getAllPatients(limit: number = 50, offset: number = 0): Promise<{ patients: PatientResponse[]; total: number }> {
    const allPatients = Object.values(this.patients);
    const total = allPatients.length;
    const patients = allPatients
      .slice(offset, offset + limit)
      .map(patient => this.mapToPatientResponse(patient));

    return { patients, total };
  }

  async searchPatients(query: string): Promise<PatientResponse[]> {
    const searchTerm = query.toLowerCase();
    const matchingPatients = Object.values(this.patients).filter(patient => {
      const firstName = patient.name?.[0]?.given?.[0]?.toLowerCase() || '';
      const lastName = patient.name?.[0]?.family?.toLowerCase() || '';
      const mrn = patient.identifier?.[0]?.value?.toLowerCase() || '';
      
      return firstName.includes(searchTerm) || 
             lastName.includes(searchTerm) || 
             mrn.includes(searchTerm);
    });

    return matchingPatients.map(patient => this.mapToPatientResponse(patient));
  }

  async deletePatient(patientId: string): Promise<void> {
    if (!this.patients[patientId]) {
      throw new AppError('Patient not found', 404);
    }

    delete this.patients[patientId];
    logger.info('Patient deleted successfully', { patientId });
  }

  private mapToPatientResponse(fhirPatient: PediatricPatient): PatientResponse {
    const birthDate = parseISO(fhirPatient.birthDate || '');
    const age = differenceInYears(new Date(), birthDate);
    
    const complexityExtension = fhirPatient.extension?.find(
      ext => ext.url === 'http://example.org/fhir/StructureDefinition/pediatric-care-complexity'
    );

    const emergencyContact = fhirPatient.contact?.[0];
    const address = fhirPatient.address?.[0];
    const emailTelecom = fhirPatient.telecom?.find(t => t.system === 'email');
    const phoneTelecom = fhirPatient.telecom?.find(t => t.system === 'phone');

    return {
      id: fhirPatient.id || '',
      firstName: fhirPatient.name?.[0]?.given?.[0] || '',
      lastName: fhirPatient.name?.[0]?.family || '',
      dateOfBirth: fhirPatient.birthDate || '',
      age,
      gender: fhirPatient.gender || 'unknown',
      email: emailTelecom?.value,
      phone: phoneTelecom?.value,
      address: address ? {
        line1: address.line?.[0] || '',
        line2: address.line?.[1],
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'US'
      } : undefined,
      emergencyContact: emergencyContact ? {
        name: `${emergencyContact.name?.given?.join(' ') || ''} ${emergencyContact.name?.family || ''}`.trim(),
        relationship: emergencyContact.relationship?.[0]?.coding?.[0]?.display || '',
        phone: emergencyContact.telecom?.[0]?.value || ''
      } : undefined,
      careComplexity: complexityExtension?.valueCode || 'low',
      medicalRecordNumber: fhirPatient.identifier?.[0]?.value,
      active: fhirPatient.active || false,
      createdAt: fhirPatient.meta?.lastUpdated || new Date().toISOString(),
      updatedAt: fhirPatient.meta?.lastUpdated || new Date().toISOString()
    };
  }

  getFHIRPatient(patientId: string): PediatricPatient {
    const patient = this.patients[patientId];
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }
    return patient;
  }
}

export const patientService = new PatientService();