export interface FHIRObservation {
  resourceType: 'Observation';
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  code: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  encounter?: {
    reference: string;
  };
  effectiveDateTime?: string;
  effectivePeriod?: {
    start?: string;
    end?: string;
  };
  issued?: string;
  performer?: Array<{
    reference: string;
    display?: string;
  }>;
  valueQuantity?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  valueCodeableConcept?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  valueString?: string;
  valueBoolean?: boolean;
  valueDateTime?: string;
  dataAbsentReason?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  interpretation?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  note?: Array<{
    text: string;
    time?: string;
  }>;
  referenceRange?: Array<{
    low?: {
      value?: number;
      unit?: string;
      system?: string;
      code?: string;
    };
    high?: {
      value?: number;
      unit?: string;
      system?: string;
      code?: string;
    };
    type?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
    text?: string;
  }>;
}

export interface VitalSignsObservation extends FHIRObservation {
  category: Array<{
    coding: Array<{
      system: 'http://terminology.hl7.org/CodeSystem/observation-category';
      code: 'vital-signs';
      display: 'Vital Signs';
    }>;
  }>;
}

export interface ObservationCreateRequest {
  patientId: string;
  type: 'vital-signs' | 'laboratory' | 'assessment' | 'care-plan';
  code: string;
  display: string;
  value?: number | string | boolean;
  unit?: string;
  status: 'preliminary' | 'final' | 'amended';
  effectiveDateTime: string;
  performerId?: string;
  notes?: string;
  interpretation?: 'normal' | 'abnormal' | 'high' | 'low' | 'critical';
}

export interface ObservationResponse {
  id: string;
  patientId: string;
  type: string;
  code: string;
  display: string;
  value?: number | string | boolean;
  unit?: string;
  status: string;
  effectiveDateTime: string;
  performerId?: string;
  notes?: string;
  interpretation?: string;
  createdAt: string;
  updatedAt: string;
}

export const PEDIATRIC_VITAL_SIGNS = {
  HEART_RATE: {
    code: '8867-4',
    display: 'Heart rate',
    system: 'http://loinc.org',
    unit: '/min'
  },
  RESPIRATORY_RATE: {
    code: '9279-1',
    display: 'Respiratory rate',
    system: 'http://loinc.org',
    unit: '/min'
  },
  BODY_TEMPERATURE: {
    code: '8310-5',
    display: 'Body temperature',
    system: 'http://loinc.org',
    unit: 'Cel'
  },
  BLOOD_PRESSURE_SYSTOLIC: {
    code: '8480-6',
    display: 'Systolic blood pressure',
    system: 'http://loinc.org',
    unit: 'mm[Hg]'
  },
  BLOOD_PRESSURE_DIASTOLIC: {
    code: '8462-4',
    display: 'Diastolic blood pressure',
    system: 'http://loinc.org',
    unit: 'mm[Hg]'
  },
  OXYGEN_SATURATION: {
    code: '2708-6',
    display: 'Oxygen saturation in Arterial blood',
    system: 'http://loinc.org',
    unit: '%'
  },
  WEIGHT: {
    code: '29463-7',
    display: 'Body weight',
    system: 'http://loinc.org',
    unit: 'kg'
  },
  HEIGHT: {
    code: '8302-2',
    display: 'Body height',
    system: 'http://loinc.org',
    unit: 'cm'
  },
  HEAD_CIRCUMFERENCE: {
    code: '9843-4',
    display: 'Head Occipital-frontal circumference',
    system: 'http://loinc.org',
    unit: 'cm'
  }
};