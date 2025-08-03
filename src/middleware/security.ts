import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      requestStartTime?: number;
    }
  }
}

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.correlationId = req.headers['x-correlation-id'] as string || crypto.randomUUID();
  req.requestStartTime = Date.now();
  
  res.setHeader('X-Correlation-ID', req.correlationId);
  
  next();
};

export const hipaaComplianceHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim().replace(/[<>]/g, '');
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

export const auditLogger = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const responseTime = Date.now() - (req.requestStartTime || Date.now());
    
    const auditData = {
      correlationId: req.correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', auditData);
    } else {
      logger.info('Request completed successfully', auditData);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    
    if (contentLength > maxSize) {
      logger.warn('Request size limit exceeded', {
        correlationId: req.correlationId,
        contentLength,
        maxSize,
        ip: req.ip
      });
      
      res.status(413).json({
        error: 'Request too large',
        message: `Request size ${contentLength} bytes exceeds limit of ${maxSize} bytes`,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    next();
  };
};

export const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === 'development' || allowedIPs.length === 0) {
      return next();
    }
    
    const clientIP = req.ip;
    
    if (!allowedIPs.includes(clientIP)) {
      logger.warn('IP not whitelisted', {
        correlationId: req.correlationId,
        clientIP,
        allowedIPs
      });
      
      res.status(403).json({
        error: 'Access forbidden',
        message: 'Your IP address is not authorized to access this resource',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    next();
  };
};

export const dataMinimization = (req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (data && typeof data === 'object' && data.data) {
      const minimizedData = { ...data };
      
      if (Array.isArray(minimizedData.data)) {
        minimizedData.data = minimizedData.data.map((item: any) => {
          if (item && typeof item === 'object') {
            const { id, firstName, lastName, dateOfBirth, gender, careComplexity, ...rest } = item;
            return {
              id,
              firstName,
              lastName: lastName ? lastName.charAt(0) + '*'.repeat(lastName.length - 1) : lastName,
              dateOfBirth: dateOfBirth ? dateOfBirth.substring(0, 4) + '-**-**' : dateOfBirth,
              gender,
              careComplexity,
              ...rest
            };
          }
          return item;
        });
      } else if (minimizedData.data && typeof minimizedData.data === 'object') {
        const { id, firstName, lastName, dateOfBirth, gender, careComplexity, ...rest } = minimizedData.data;
        minimizedData.data = {
          id,
          firstName,
          lastName: lastName ? lastName.charAt(0) + '*'.repeat(lastName.length - 1) : lastName,
          dateOfBirth: dateOfBirth ? dateOfBirth.substring(0, 4) + '-**-**' : dateOfBirth,
          gender,
          careComplexity,
          ...rest
        };
      }
      
      return originalJson.call(this, minimizedData);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};