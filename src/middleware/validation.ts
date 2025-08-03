import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      next(new AppError(`Validation error: ${errorMessage}`, 400));
      return;
    }
    
    req.body = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      next(new AppError(`Parameter validation error: ${errorMessage}`, 400));
      return;
    }
    
    req.params = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      next(new AppError(`Query validation error: ${errorMessage}`, 400));
      return;
    }
    
    req.query = value;
    next();
  };
};

export const patientValidationSchemas = {
  create: Joi.object({
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    dateOfBirth: Joi.date().iso().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other', 'unknown').required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    address: Joi.object({
      line1: Joi.string().required(),
      line2: Joi.string().optional(),
      city: Joi.string().required(),
      state: Joi.string().length(2).required(),
      postalCode: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required(),
      country: Joi.string().default('US')
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required()
    }).optional(),
    careComplexity: Joi.string().valid('low', 'moderate', 'high', 'critical').default('low'),
    medicalRecordNumber: Joi.string().optional()
  }),
  
  update: Joi.object({
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    address: Joi.object({
      line1: Joi.string().required(),
      line2: Joi.string().optional(),
      city: Joi.string().required(),
      state: Joi.string().length(2).required(),
      postalCode: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required(),
      country: Joi.string().default('US')
    }).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required()
    }).optional(),
    careComplexity: Joi.string().valid('low', 'moderate', 'high', 'critical').optional(),
    active: Joi.boolean().optional()
  }).min(1)
};

export const observationValidationSchemas = {
  create: Joi.object({
    patientId: Joi.string().uuid().required(),
    type: Joi.string().valid('vital-signs', 'laboratory', 'assessment', 'care-plan').required(),
    code: Joi.string().required(),
    display: Joi.string().required(),
    value: Joi.alternatives().try(Joi.number(), Joi.string(), Joi.boolean()).optional(),
    unit: Joi.string().optional(),
    status: Joi.string().valid('preliminary', 'final', 'amended').default('final'),
    effectiveDateTime: Joi.date().iso().required(),
    performerId: Joi.string().uuid().optional(),
    notes: Joi.string().max(1000).optional(),
    interpretation: Joi.string().valid('normal', 'abnormal', 'high', 'low', 'critical').optional()
  })
};

export const appointmentValidationSchemas = {
  create: Joi.object({
    patientId: Joi.string().uuid().required(),
    providerId: Joi.string().uuid().optional(),
    appointmentType: Joi.string().valid('routine-checkup', 'follow-up', 'emergency', 'consultation', 'therapy', 'vaccination').required(),
    specialty: Joi.string().valid('pediatrics', 'cardiology', 'neurology', 'pulmonology', 'psychiatry', 'physical-therapy').optional(),
    startDateTime: Joi.date().iso().min('now').required(),
    endDateTime: Joi.date().iso().greater(Joi.ref('startDateTime')).required(),
    priority: Joi.string().valid('routine', 'urgent', 'asap', 'stat').default('routine'),
    description: Joi.string().max(500).optional(),
    reasonForVisit: Joi.string().max(200).optional(),
    location: Joi.string().max(100).optional(),
    telehealth: Joi.boolean().default(false),
    notes: Joi.string().max(1000).optional()
  }),
  
  update: Joi.object({
    status: Joi.string().valid('proposed', 'pending', 'booked', 'arrived', 'fulfilled', 'cancelled', 'noshow', 'checked-in').optional(),
    startDateTime: Joi.date().iso().optional(),
    endDateTime: Joi.date().iso().optional(),
    providerId: Joi.string().uuid().optional(),
    location: Joi.string().max(100).optional(),
    notes: Joi.string().max(1000).optional(),
    cancelationReason: Joi.string().max(200).optional()
  }).min(1)
};

export const idValidationSchema = Joi.object({
  id: Joi.string().uuid().required()
});