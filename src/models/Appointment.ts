export interface FHIRAppointment {
  resourceType: 'Appointment';
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
  identifier?: Array<{
    use?: string;
    system?: string;
    value?: string;
  }>;
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'entered-in-error' | 'checked-in' | 'waitlist';
  cancelationReason?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  serviceCategory?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  serviceType?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  specialty?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  appointmentType?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  reasonCode?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  priority?: number;
  description?: string;
  start?: string;
  end?: string;
  minutesDuration?: number;
  slot?: Array<{
    reference: string;
  }>;
  created?: string;
  comment?: string;
  participant: Array<{
    type?: Array<{
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    }>;
    actor?: {
      reference: string;
      display?: string;
    };
    required?: 'required' | 'optional' | 'information-only';
    status: 'accepted' | 'declined' | 'tentative' | 'needs-action';
  }>;
}

export interface AppointmentCreateRequest {
  patientId: string;
  providerId?: string;
  appointmentType: 'routine-checkup' | 'follow-up' | 'emergency' | 'consultation' | 'therapy' | 'vaccination';
  specialty?: 'pediatrics' | 'cardiology' | 'neurology' | 'pulmonology' | 'psychiatry' | 'physical-therapy';
  startDateTime: string;
  endDateTime: string;
  priority: 'routine' | 'urgent' | 'asap' | 'stat';
  description?: string;
  reasonForVisit?: string;
  location?: string;
  telehealth?: boolean;
  notes?: string;
}

export interface AppointmentResponse {
  id: string;
  patientId: string;
  patientName: string;
  providerId?: string;
  providerName?: string;
  appointmentType: string;
  specialty?: string;
  status: string;
  startDateTime: string;
  endDateTime: string;
  duration: number;
  priority: string;
  description?: string;
  reasonForVisit?: string;
  location?: string;
  telehealth: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentUpdateRequest {
  status?: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'checked-in';
  startDateTime?: string;
  endDateTime?: string;
  providerId?: string;
  location?: string;
  notes?: string;
  cancelationReason?: string;
}

export const PEDIATRIC_APPOINTMENT_TYPES = {
  ROUTINE_CHECKUP: {
    code: 'routine-checkup',
    display: 'Routine Pediatric Checkup',
    duration: 30
  },
  FOLLOW_UP: {
    code: 'follow-up',
    display: 'Follow-up Visit',
    duration: 20
  },
  EMERGENCY: {
    code: 'emergency',
    display: 'Emergency Visit',
    duration: 60
  },
  CONSULTATION: {
    code: 'consultation',
    display: 'Specialist Consultation',
    duration: 45
  },
  THERAPY: {
    code: 'therapy',
    display: 'Therapy Session',
    duration: 60
  },
  VACCINATION: {
    code: 'vaccination',
    display: 'Vaccination Appointment',
    duration: 15
  }
};

export const PEDIATRIC_SPECIALTIES = {
  PEDIATRICS: {
    code: 'pediatrics',
    display: 'General Pediatrics',
    system: 'http://snomed.info/sct'
  },
  PEDIATRIC_CARDIOLOGY: {
    code: 'pediatric-cardiology',
    display: 'Pediatric Cardiology',
    system: 'http://snomed.info/sct'
  },
  PEDIATRIC_NEUROLOGY: {
    code: 'pediatric-neurology',
    display: 'Pediatric Neurology',
    system: 'http://snomed.info/sct'
  },
  PEDIATRIC_PULMONOLOGY: {
    code: 'pediatric-pulmonology',
    display: 'Pediatric Pulmonology',
    system: 'http://snomed.info/sct'
  },
  CHILD_PSYCHIATRY: {
    code: 'child-psychiatry',
    display: 'Child and Adolescent Psychiatry',
    system: 'http://snomed.info/sct'
  },
  PEDIATRIC_PHYSICAL_THERAPY: {
    code: 'pediatric-pt',
    display: 'Pediatric Physical Therapy',
    system: 'http://snomed.info/sct'
  }
};