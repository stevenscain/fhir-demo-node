import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { observationService } from '../services/observationService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateParams, validateQuery, observationValidationSchemas, idValidationSchema } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = Router();

router.post('/', 
  validateBody(observationValidationSchemas.create),
  asyncHandler(async (req: Request, res: Response) => {
    const observation = await observationService.createObservation(req.body);
    
    logger.info('Observation created via API', { 
      observationId: observation.id,
      patientId: observation.patientId,
      type: observation.type 
    });
    
    res.status(201).json({
      success: true,
      data: observation,
      message: 'Observation created successfully'
    });
  })
);

router.get('/:id', 
  validateParams(idValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const observation = await observationService.getObservationById(req.params.id);
    
    res.json({
      success: true,
      data: observation
    });
  })
);

router.put('/:id', 
  validateParams(idValidationSchema),
  validateBody(Joi.object({
    value: Joi.alternatives().try(Joi.number(), Joi.string(), Joi.boolean()).optional(),
    unit: Joi.string().optional(),
    status: Joi.string().valid('preliminary', 'final', 'amended').optional(),
    notes: Joi.string().max(1000).optional(),
    interpretation: Joi.string().valid('normal', 'abnormal', 'high', 'low', 'critical').optional()
  }).min(1)),
  asyncHandler(async (req: Request, res: Response) => {
    const observation = await observationService.updateObservation(req.params.id, req.body);
    
    logger.info('Observation updated via API', { observationId: req.params.id });
    
    res.json({
      success: true,
      data: observation,
      message: 'Observation updated successfully'
    });
  })
);

router.delete('/:id', 
  validateParams(idValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await observationService.deleteObservation(req.params.id);
    
    logger.info('Observation deleted via API', { observationId: req.params.id });
    
    res.status(204).send();
  })
);

router.get('/patient/:patientId', 
  validateParams(Joi.object({ patientId: Joi.string().uuid().required() })),
  validateQuery(Joi.object({
    type: Joi.string().valid('vital-signs', 'laboratory', 'assessment', 'care-plan').optional()
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const { type } = req.query as any;
    
    const observations = await observationService.getObservationsByPatient(patientId, type);
    
    res.json({
      success: true,
      data: {
        observations,
        count: observations.length,
        patientId
      }
    });
  })
);

router.get('/patient/:patientId/vital-signs', 
  validateParams(Joi.object({ patientId: Joi.string().uuid().required() })),
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    
    const vitalSigns = await observationService.getVitalSignsForPatient(patientId);
    
    res.json({
      success: true,
      data: {
        vitalSigns,
        count: vitalSigns.length,
        patientId
      }
    });
  })
);

router.get('/patient/:patientId/vital-signs/latest', 
  validateParams(Joi.object({ patientId: Joi.string().uuid().required() })),
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    
    const latestVitalSigns = await observationService.getLatestVitalSigns(patientId);
    
    res.json({
      success: true,
      data: {
        latestVitalSigns,
        patientId
      }
    });
  })
);

export { router as observationRoutes };