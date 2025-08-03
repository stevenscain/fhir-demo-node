import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { appointmentService } from '../services/appointmentService';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateParams, validateQuery, appointmentValidationSchemas, idValidationSchema } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = Router();

router.post('/', 
  validateBody(appointmentValidationSchemas.create),
  asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.createAppointment(req.body);
    
    logger.info('Appointment created via API', { 
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      type: appointment.appointmentType 
    });
    
    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully'
    });
  })
);

router.get('/:id', 
  validateParams(idValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    
    res.json({
      success: true,
      data: appointment
    });
  })
);

router.put('/:id', 
  validateParams(idValidationSchema),
  validateBody(appointmentValidationSchemas.update),
  asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
    
    logger.info('Appointment updated via API', { appointmentId: req.params.id });
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment updated successfully'
    });
  })
);

router.delete('/:id', 
  validateParams(idValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await appointmentService.deleteAppointment(req.params.id);
    
    logger.info('Appointment deleted via API', { appointmentId: req.params.id });
    
    res.status(204).send();
  })
);

router.post('/:id/cancel', 
  validateParams(idValidationSchema),
  validateBody(Joi.object({
    reason: Joi.string().required().max(200)
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.cancelAppointment(req.params.id, req.body.reason);
    
    logger.info('Appointment cancelled via API', { 
      appointmentId: req.params.id,
      reason: req.body.reason 
    });
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully'
    });
  })
);

router.post('/:id/check-in', 
  validateParams(idValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.checkInAppointment(req.params.id);
    
    logger.info('Patient checked in for appointment', { appointmentId: req.params.id });
    
    res.json({
      success: true,
      data: appointment,
      message: 'Patient checked in successfully'
    });
  })
);

router.post('/:id/complete', 
  validateParams(idValidationSchema),
  validateBody(Joi.object({
    notes: Joi.string().optional().max(1000)
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.completeAppointment(req.params.id, req.body.notes);
    
    logger.info('Appointment completed via API', { appointmentId: req.params.id });
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment completed successfully'
    });
  })
);

router.get('/patient/:patientId', 
  validateParams(Joi.object({ patientId: Joi.string().uuid().required() })),
  validateQuery(Joi.object({
    status: Joi.string().valid('proposed', 'pending', 'booked', 'arrived', 'fulfilled', 'cancelled', 'noshow', 'checked-in').optional()
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;
    const { status } = req.query as any;
    
    const appointments = await appointmentService.getAppointmentsByPatient(patientId, status);
    
    res.json({
      success: true,
      data: {
        appointments,
        count: appointments.length,
        patientId
      }
    });
  })
);

router.get('/upcoming', 
  validateQuery(Joi.object({
    patientId: Joi.string().uuid().optional()
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.query as any;
    
    const appointments = await appointmentService.getUpcomingAppointments(patientId);
    
    res.json({
      success: true,
      data: {
        appointments,
        count: appointments.length
      }
    });
  })
);

router.get('/date-range', 
  validateQuery(Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    patientId: Joi.string().uuid().optional()
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, patientId } = req.query as any;
    
    const appointments = await appointmentService.getAppointmentsByDateRange(startDate, endDate, patientId);
    
    res.json({
      success: true,
      data: {
        appointments,
        count: appointments.length,
        dateRange: { startDate, endDate }
      }
    });
  })
);

export { router as appointmentRoutes };