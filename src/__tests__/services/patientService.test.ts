import { patientService } from '../../services/patientService';
import { PatientCreateRequest } from '../../models/Patient';

describe('PatientService', () => {
  const mockPatientData: PatientCreateRequest = {
    firstName: 'Emma',
    lastName: 'Johnson',
    dateOfBirth: '2018-05-15',
    gender: 'female',
    email: 'parent@example.com',
    phone: '+1-555-0123',
    address: {
      line1: '123 Pediatric Lane',
      city: 'Healthcare City',
      state: 'CA',
      postalCode: '90210'
    },
    emergencyContact: {
      name: 'Sarah Johnson',
      relationship: 'Mother',
      phone: '+1-555-0123'
    },
    careComplexity: 'moderate',
    medicalRecordNumber: 'MRN-TEST-001'
  };

  beforeEach(() => {
    (patientService as any).patients = {};
  });

  describe('createPatient', () => {
    it('should create a patient successfully', async () => {
      const result = await patientService.createPatient(mockPatientData);

      expect(result).toBeDefined();
      expect(result.firstName).toBe('Emma');
      expect(result.lastName).toBe('Johnson');
      expect(result.gender).toBe('female');
      expect(result.careComplexity).toBe('moderate');
      expect(result.active).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.age).toBe(5);
    });

    it('should generate a medical record number if not provided', async () => {
      const patientDataWithoutMRN = { ...mockPatientData };
      delete patientDataWithoutMRN.medicalRecordNumber;

      const result = await patientService.createPatient(patientDataWithoutMRN);

      expect(result.medicalRecordNumber).toBeDefined();
      expect(result.medicalRecordNumber).toMatch(/^MRN-/);
    });
  });

  describe('getPatientById', () => {
    it('should retrieve a patient by ID', async () => {
      const createdPatient = await patientService.createPatient(mockPatientData);
      const retrievedPatient = await patientService.getPatientById(createdPatient.id);

      expect(retrievedPatient).toEqual(createdPatient);
    });

    it('should throw error for non-existent patient', async () => {
      await expect(patientService.getPatientById('non-existent-id'))
        .rejects.toThrow('Patient not found');
    });
  });

  describe('updatePatient', () => {
    it('should update patient information', async () => {
      const createdPatient = await patientService.createPatient(mockPatientData);
      
      const updates = {
        firstName: 'Emily',
        careComplexity: 'high' as const
      };

      const updatedPatient = await patientService.updatePatient(createdPatient.id, updates);

      expect(updatedPatient.firstName).toBe('Emily');
      expect(updatedPatient.lastName).toBe('Johnson');
      expect(updatedPatient.careComplexity).toBe('high');
    });
  });

  describe('searchPatients', () => {
    beforeEach(async () => {
      await patientService.createPatient({
        ...mockPatientData,
        firstName: 'Emma',
        lastName: 'Johnson'
      });
      
      await patientService.createPatient({
        ...mockPatientData,
        firstName: 'Noah',
        lastName: 'Smith',
        medicalRecordNumber: 'MRN-TEST-002'
      });
    });

    it('should find patients by first name', async () => {
      const results = await patientService.searchPatients('Emma');
      expect(results).toHaveLength(1);
      expect(results[0].firstName).toBe('Emma');
    });

    it('should find patients by last name', async () => {
      const results = await patientService.searchPatients('smith');
      expect(results).toHaveLength(1);
      expect(results[0].lastName).toBe('Smith');
    });

    it('should find patients by medical record number', async () => {
      const results = await patientService.searchPatients('MRN-TEST-002');
      expect(results).toHaveLength(1);
      expect(results[0].firstName).toBe('Noah');
    });

    it('should return empty array for no matches', async () => {
      const results = await patientService.searchPatients('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('getAllPatients', () => {
    beforeEach(async () => {
      for (let i = 0; i < 5; i++) {
        await patientService.createPatient({
          ...mockPatientData,
          firstName: `Patient${i}`,
          medicalRecordNumber: `MRN-${i}`
        });
      }
    });

    it('should return paginated results', async () => {
      const result = await patientService.getAllPatients(3, 0);
      
      expect(result.patients).toHaveLength(3);
      expect(result.total).toBe(5);
    });

    it('should handle offset correctly', async () => {
      const result = await patientService.getAllPatients(3, 3);
      
      expect(result.patients).toHaveLength(2);
      expect(result.total).toBe(5);
    });
  });

  describe('deletePatient', () => {
    it('should delete a patient successfully', async () => {
      const createdPatient = await patientService.createPatient(mockPatientData);
      
      await patientService.deletePatient(createdPatient.id);
      
      await expect(patientService.getPatientById(createdPatient.id))
        .rejects.toThrow('Patient not found');
    });

    it('should throw error when deleting non-existent patient', async () => {
      await expect(patientService.deletePatient('non-existent-id'))
        .rejects.toThrow('Patient not found');
    });
  });
});