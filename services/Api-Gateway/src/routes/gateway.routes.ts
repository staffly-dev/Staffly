import Router from 'express';
import { forwardRequest, getServiceStatus } from '../services/proxy.service';
import { config } from '../config/gateway.config';
import { HTTPSTATUS } from '../config/http.config';
import { asyncHandler } from '../middlewares/api/asyncHandler.middleware';
import { InternalServerException, NotFoundException } from '../utils/appError';

export function createGatewayRouter() {
  const router = Router();

  // Service discovery endpoint
  router.get(
    '/services',
    asyncHandler(async (req, res, next) => {
      const services = Object.values(config.services).map(service => ({
        name: service.name,
        url: service.url,
        healthCheck: service.healthCheck
      }));
      res.status(HTTPSTATUS.OK).json({
        message: 'Available services',
        services
      });
    })
  );

  // Service health status
  router.get(
    '/services/status',
    asyncHandler(async (req, res, next) => {
      try {
        const status = await getServiceStatus();
        res.status(HTTPSTATUS.OK).json({
          message: 'Service health status',
          status
        });
      } catch (error) {
        throw new InternalServerException("Failed to get service status");
      }
    })
  );

  // Proxy HRMS endpoints (no hrms required)
  router.all(
    '/api/v1/hrms/*',
    asyncHandler(async (req, res, next) => {
      const serviceName = 'hrms';
      const subPath = req.params[0] || '';
      const targetPath = 'hrms/' + subPath;
      const service = config.services[serviceName as keyof typeof config.services];
      if (!service) {
        throw new NotFoundException(`Service '${serviceName}' is not available`);
      }
      forwardRequest(serviceName, targetPath, req, res, next);
    })
  );

  // Proxy Ats Checker endpoints
  router.all(
    '/api/v1/ats_checker/*',
    asyncHandler(async (req, res, next) => {
      const serviceName = 'ats_checker';
      const subPath = req.params[0] || '';
      const targetPath = 'ats_checker/' + subPath;
      const service = config.services[serviceName as keyof typeof config.services];
      if (!service) {
        throw new NotFoundException(`Service '${serviceName}' is not available`);
      }
      forwardRequest(serviceName, targetPath, req, res, next);
    })
  );

  return router;
}