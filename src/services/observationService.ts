import { v4 as uuidv4 } from 'uuid';
import { FHIRObservation, VitalSignsObservation, ObservationCreateRequest, ObservationResponse, PEDIATRIC_VITAL_SIGNS } from '../models/Observation';
import { patientService } from './patientService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface ObservationStore {
  [id: string]: FHIRObservation;
}

class ObservationService {
  private observations: ObservationStore = {};

  async createObservation(observationData: ObservationCreateRequest): Promise<ObservationResponse> {
    try {
      const patient = patientService.getFHIRPatient(observationData.patientId);
      
      const observationId = uuidv4();
      const now = new Date().toISOString();

      const fhirObservation: FHIRObservation = {
        resourceType: 'Observation',
        id: observationId,
        meta: {
          versionId: '1',
          lastUpdated: now,
          profile: this.getProfileForObservationType(observationData.type)
        },
        status: observationData.status,
        category: this.getCategoryForObservationType(observationData.type),
        code: {
          coding: [{
            system: this.getSystemForCode(observationData.code),
            code: observationData.code,
            display: observationData.display
          }],
          text: observationData.display
        },
        subject: {
          reference: `Patient/${observationData.patientId}`,
          display: `${patient.name?.[0]?.given?.[0]} ${patient.name?.[0]?.family}`
        },
        effectiveDateTime: observationData.effectiveDateTime,
        issued: now,
        performer: observationData.performerId ? [{
          reference: `Practitioner/${observationData.performerId}`
        }] : undefined,
        ...(typeof observationData.value === 'number' ? {
          valueQuantity: {
            value: observationData.value,
            unit: observationData.unit,
            system: 'http://unitsofmeasure.org',
            code: observationData.unit
          }
        } : typeof observationData.value === 'string' ? {
          valueString: observationData.value
        } : typeof observationData.value === 'boolean' ? {
          valueBoolean: observationData.value
        } : {}),
        interpretation: observationData.interpretation ? [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: this.getInterpretationCode(observationData.interpretation),
            display: observationData.interpretation
          }]
        }] : undefined,
        note: observationData.notes ? [{
          text: observationData.notes,
          time: now
        }] : undefined,
        referenceRange: this.getReferenceRangeForVitalSign(observationData.code, patient.birthDate)
      };

      this.observations[observationId] = fhirObservation;

      logger.info('Observation created successfully', { 
        observationId, 
        patientId: observationData.patientId,
        type: observationData.type,
        code: observationData.code 
      });

      return this.mapToObservationResponse(fhirObservation);
    } catch (error) {
      logger.error('Error creating observation', { error: error.message, observationData });
      throw new AppError('Failed to create observation', 500);
    }
  }

  async getObservationById(observationId: string): Promise<ObservationResponse> {
    const observation = this.observations[observationId];
    if (!observation) {
      throw new AppError('Observation not found', 404);
    }

    return this.mapToObservationResponse(observation);
  }

  async getObservationsByPatient(patientId: string, type?: string): Promise<ObservationResponse[]> {
    const observations = Object.values(this.observations).filter(obs => {
      const matchesPatient = obs.subject.reference === `Patient/${patientId}`;
      if (!type) return matchesPatient;
      
      const observationType = this.getObservationTypeFromCategory(obs.category);
      return matchesPatient && observationType === type;
    });

    return observations.map(obs => this.mapToObservationResponse(obs));
  }

  async getVitalSignsForPatient(patientId: string): Promise<ObservationResponse[]> {
    return this.getObservationsByPatient(patientId, 'vital-signs');
  }

  async getLatestVitalSigns(patientId: string): Promise<{ [key: string]: ObservationResponse }> {
    const vitalSigns = await this.getVitalSignsForPatient(patientId);
    
    const latestByCode: { [key: string]: ObservationResponse } = {};
    
    vitalSigns.forEach(vital => {
      const existing = latestByCode[vital.code];
      if (!existing || new Date(vital.effectiveDateTime) > new Date(existing.effectiveDateTime)) {
        latestByCode[vital.code] = vital;
      }
    });

    return latestByCode;
  }

  async updateObservation(observationId: string, updates: Partial<ObservationCreateRequest>): Promise<ObservationResponse> {
    const existingObservation = this.observations[observationId];
    if (!existingObservation) {
      throw new AppError('Observation not found', 404);
    }

    try {
      const now = new Date().toISOString();
      const updatedObservation: FHIRObservation = {
        ...existingObservation,
        meta: {
          ...existingObservation.meta,
          versionId: (parseInt(existingObservation.meta?.versionId || '1') + 1).toString(),
          lastUpdated: now
        },
        status: updates.status || existingObservation.status,
        ...(updates.value !== undefined ? (
          typeof updates.value === 'number' ? {
            valueQuantity: {
              value: updates.value,
              unit: updates.unit || existingObservation.valueQuantity?.unit,
              system: 'http://unitsofmeasure.org',
              code: updates.unit || existingObservation.valueQuantity?.code
            }
          } : typeof updates.value === 'string' ? {
            valueString: updates.value
          } : typeof updates.value === 'boolean' ? {
            valueBoolean: updates.value
          } : {}
        ) : {}),
        interpretation: updates.interpretation ? [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: this.getInterpretationCode(updates.interpretation),
            display: updates.interpretation
          }]
        }] : existingObservation.interpretation,
        note: updates.notes ? [{
          text: updates.notes,
          time: now
        }] : existingObservation.note
      };

      this.observations[observationId] = updatedObservation;

      logger.info('Observation updated successfully', { observationId });

      return this.mapToObservationResponse(updatedObservation);
    } catch (error) {
      logger.error('Error updating observation', { error: error.message, observationId, updates });
      throw new AppError('Failed to update observation', 500);
    }
  }

  async deleteObservation(observationId: string): Promise<void> {
    if (!this.observations[observationId]) {
      throw new AppError('Observation not found', 404);
    }

    delete this.observations[observationId];
    logger.info('Observation deleted successfully', { observationId });
  }

  private getProfileForObservationType(type: string): string[] {
    switch (type) {
      case 'vital-signs':
        return ['http://hl7.org/fhir/StructureDefinition/vitalsigns'];
      case 'laboratory':
        return ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab'];
      default:
        return ['http://hl7.org/fhir/StructureDefinition/Observation'];
    }
  }

  private getCategoryForObservationType(type: string) {
    switch (type) {
      case 'vital-signs':
        return [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }];
      case 'laboratory':
        return [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory',
            display: 'Laboratory'
          }]
        }];
      case 'assessment':
        return [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'assessment',
            display: 'Assessment'
          }]
        }];
      default:
        return [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'survey',
            display: 'Survey'
          }]
        }];
    }
  }

  private getSystemForCode(code: string): string {
    return Object.values(PEDIATRIC_VITAL_SIGNS).some(vs => vs.code === code) 
      ? 'http://loinc.org' 
      : 'http://snomed.info/sct';
  }

  private getInterpretationCode(interpretation: string): string {
    const mapping: { [key: string]: string } = {
      'normal': 'N',
      'abnormal': 'A',
      'high': 'H',
      'low': 'L',
      'critical': 'AA'
    };
    return mapping[interpretation] || 'N';
  }

  private getObservationTypeFromCategory(category?: Array<{ coding?: Array<{ code?: string }> }>): string {
    const categoryCode = category?.[0]?.coding?.[0]?.code;
    return categoryCode || 'unknown';
  }

  private getReferenceRangeForVitalSign(code: string, birthDate?: string) {
    if (!birthDate) return undefined;

    const ageInMonths = Math.floor((Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44));

    const pediatricRanges: { [key: string]: (ageInMonths: number) => { low?: number; high?: number; unit: string } | undefined } = {
      '8867-4': (age) => {
        if (age < 12) return { low: 100, high: 160, unit: '/min' };
        if (age < 24) return { low: 90, high: 150, unit: '/min' };
        if (age < 60) return { low: 80, high: 130, unit: '/min' };
        if (age < 120) return { low: 70, high: 110, unit: '/min' };
        return { low: 60, high: 100, unit: '/min' };
      },
      '9279-1': (age) => {
        if (age < 12) return { low: 30, high: 60, unit: '/min' };
        if (age < 24) return { low: 24, high: 40, unit: '/min' };
        if (age < 60) return { low: 20, high: 30, unit: '/min' };
        return { low: 16, high: 25, unit: '/min' };
      },
      '8310-5': (age) => {
        return { low: 36.1, high: 37.2, unit: 'Cel' };
      }
    };

    const rangeFunction = pediatricRanges[code];
    if (!rangeFunction) return undefined;

    const range = rangeFunction(ageInMonths);
    if (!range) return undefined;

    return [{
      low: range.low ? {
        value: range.low,
        unit: range.unit,
        system: 'http://unitsofmeasure.org',
        code: range.unit
      } : undefined,
      high: range.high ? {
        value: range.high,
        unit: range.unit,
        system: 'http://unitsofmeasure.org',
        code: range.unit
      } : undefined,
      type: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning',
          code: 'normal',
          display: 'Normal Range'
        }]
      }
    }];
  }

  private mapToObservationResponse(fhirObservation: FHIRObservation): ObservationResponse {
    const patientId = fhirObservation.subject.reference.replace('Patient/', '');
    const performerId = fhirObservation.performer?.[0]?.reference?.replace('Practitioner/', '');
    
    let value: number | string | boolean | undefined;
    if (fhirObservation.valueQuantity) {
      value = fhirObservation.valueQuantity.value;
    } else if (fhirObservation.valueString) {
      value = fhirObservation.valueString;
    } else if (fhirObservation.valueBoolean !== undefined) {
      value = fhirObservation.valueBoolean;
    }

    return {
      id: fhirObservation.id || '',
      patientId,
      type: this.getObservationTypeFromCategory(fhirObservation.category),
      code: fhirObservation.code.coding?.[0]?.code || '',
      display: fhirObservation.code.text || fhirObservation.code.coding?.[0]?.display || '',
      value,
      unit: fhirObservation.valueQuantity?.unit,
      status: fhirObservation.status,
      effectiveDateTime: fhirObservation.effectiveDateTime || '',
      performerId,
      notes: fhirObservation.note?.[0]?.text,
      interpretation: fhirObservation.interpretation?.[0]?.coding?.[0]?.display,
      createdAt: fhirObservation.meta?.lastUpdated || new Date().toISOString(),
      updatedAt: fhirObservation.meta?.lastUpdated || new Date().toISOString()
    };
  }
}

export const observationService = new ObservationService();