export interface FHIRPatient {
  resourceType: 'Patient';
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
  identifier?: Array<{
    use?: 'usual' | 'official' | 'temp' | 'secondary';
    type?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
    system?: string;
    value?: string;
  }>;
  active?: boolean;
  name?: Array<{
    use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
    family?: string;
    given?: string[];
    prefix?: string[];
    suffix?: string[];
  }>;
  telecom?: Array<{
    system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
    value?: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    type?: 'postal' | 'physical' | 'both';
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  contact?: Array<{
    relationship?: Array<{
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    }>;
    name?: {
      family?: string;
      given?: string[];
    };
    telecom?: Array<{
      system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
      value?: string;
      use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
    }>;
  }>;
  extension?: Array<{
    url: string;
    valueString?: string;
    valueBoolean?: boolean;
    valueDateTime?: string;
    valueCode?: string;
  }>;
}

export interface PediatricPatient extends FHIRPatient {
  extension?: Array<{
    url: string;
    valueString?: string;
    valueBoolean?: boolean;
    valueDateTime?: string;
    valueCode?: string;
  }> & Array<{
    url: 'http://example.org/fhir/StructureDefinition/pediatric-care-complexity';
    valueCode: 'low' | 'moderate' | 'high' | 'critical';
  } | {
    url: 'http://example.org/fhir/StructureDefinition/care-team-size';
    valueString: string;
  } | {
    url: 'http://example.org/fhir/StructureDefinition/primary-caregiver';
    valueString: string;
  }>;
}

export interface PatientCreateRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  careComplexity?: 'low' | 'moderate' | 'high' | 'critical';
  medicalRecordNumber?: string;
}

export interface PatientResponse {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  careComplexity: string;
  medicalRecordNumber?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}