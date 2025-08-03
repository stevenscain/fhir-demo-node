import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: 'healthy' | 'unhealthy';
    memory: {
      used: string;
      total: string;
      percentage: number;
    };
  };
}

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const memoryPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

  const healthCheck: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'healthy',
      memory: {
        used: `${memoryUsedMB}MB`,
        total: `${memoryTotalMB}MB`,
        percentage: memoryPercentage
      }
    }
  };

  logger.info('Health check requested', { 
    status: healthCheck.status,
    uptime: healthCheck.uptime 
  });

  res.status(200).json(healthCheck);
}));

router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    message: 'Service is ready to accept requests'
  });
}));

router.get('/live', asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    message: 'Service is alive'
  });
}));

export { router as healthRoutes };