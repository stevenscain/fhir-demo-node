import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { patientService } from '../services/patientService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateParams, validateQuery, patientValidationSchemas, idValidationSchema } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = Router();

router.post('/', 
  validateBody(patientValidationSchemas.create),
  asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientService.createPatient(req.body);
    
    logger.info('Patient created via API', { patientId: patient.id });
    
    res.status(201).json({
      success: true,
      data: patient,
      message: 'Patient created successfully'
    });
  })
);

router.get('/', 
  validateQuery(Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    search: Joi.string().optional()
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset, search } = req.query as any;
    
    let result;
    if (search) {
      const patients = await patientService.searchPatients(search);
      result = {
        patients: patients.slice(offset, offset + limit),
        total: patients.length
      };
    } else {
      result = await patientService.getAllPatients(limit, offset);
    }
    
    res.json({
      success: true,
      data: {
        patients: result.patients,
        pagination: {
          total: result.total,
          limit,
          offset,
          hasMore: offset + limit < result.total
        }
      }
    });
  })
);

router.get('/:id', 
  validateParams(idValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientService.getPatientById(req.params.id);
    
    res.json({
      success: true,
      data: patient
    });
  })
);

router.put('/:id', 
  validateParams(idValidationSchema),
  validateBody(patientValidationSchemas.update),
  asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    
    logger.info('Patient updated via API', { patientId: req.params.id });
    
    res.json({
      success: true,
      data: patient,
      message: 'Patient updated successfully'
    });
  })
);

router.delete('/:id', 
  validateParams(idValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await patientService.deletePatient(req.params.id);
    
    logger.info('Patient deleted via API', { patientId: req.params.id });
    
    res.status(204).send();
  })
);

router.get('/:id/fhir', 
  validateParams(idValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const fhirPatient = patientService.getFHIRPatient(req.params.id);
    
    res.json(fhirPatient);
  })
);

export { router as patientRoutes };