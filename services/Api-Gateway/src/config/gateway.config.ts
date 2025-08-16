import { Env } from './env.config';

export interface ServiceConfig {
  name: string;
  url: string;
  healthCheck: string;
  timeout: number;
}

export interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  service: string;
  target: string;
  rateLimit?: number;
}

export const config = {
  // Services configuration
  services: {
    hrms: {
      name: 'hrms',
      url: Env.HRMS_SERVICE_URL,
      healthCheck: '/hrms/health',
      timeout: 5000
    } as ServiceConfig,

    ats_checker: {
      name: 'ats-system-checker',
      url: Env.ATS_CHECKER_SERVICE_URL,
      healthCheck: '/ats_checker/health',
      timeout: 5000
    } as ServiceConfig,
  },

  // Route configuration
  routes: [
    {
      path: '/api/v1/hrms/*',
      method: 'GET',
      service: 'hrms',
      target: '/*'
    },
    {
      path: '/api/v1/hrms/*',
      method: 'POST',
      service: 'hrms',
      target: '/*'
    },
    {
      path: '/api/v1/hrms/*',
      method: 'PUT',
      service: 'hrms',
      target: '/*'
    },
    {
      path: '/api/v1/hrms/*',
      method: 'PATCH',
      service: 'hrms',
      target: '/*'
    },
    {
      path: '/api/v1/hrms/*',
      method: 'DELETE',
      service: 'hrms',
      target: '/*'
    },
    {
      path: '/api/v1/ats_checker/*',
      method: 'GET',
      service: 'ats-system-checker',
      target: '/*'
    },
    {
      path: '/api/v1/ats_checker/*',
      method: 'POST',
      service: 'ats-system-checker',
      target: '/*'
    },
    {
      path: '/api/v1/ats_checker/*',
      method: 'PUT',
      service: 'ats-system-checker',
      target: '/*'
    },
    {
      path: '/api/v1/ats_checker/*',
      method: 'PATCH',
      service: 'ats-system-checker',
      target: '/*'
    },
    {
      path: '/api/v1/ats_checker/*',
      method: 'DELETE',
      service: 'ats-system-checker',
      target: '/*'
    },
  ] as RouteConfig[],

  // Gateway settings
  gateway: {
    timeout: 10000,
    retries: 3,
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100 // requests per window
  },
};