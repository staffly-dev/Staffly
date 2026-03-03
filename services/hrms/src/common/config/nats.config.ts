import { NatsOptions, Transport } from '@nestjs/microservices';
import configuration from './configuration';

export const getNatsConfig = (): NatsOptions => {
  const config = configuration();

  return {
    transport: Transport.NATS,
    options: {
      servers: config.NATS_URL || 'nats://localhost:4222',

      // TLS Configuration
      tls: config.NATS_TLS_CA_FILE ? {
        caFile: config.NATS_TLS_CA_FILE,
        keyFile: config.NATS_TLS_KEY_FILE,
        certFile: config.NATS_TLS_CERT_FILE,
      } : undefined,

      // Authentication
      auth: config.NATS_AUTH_TOKEN ? {
        token: config.NATS_AUTH_TOKEN,
      } : undefined,

      // Connection security
      maxReconnectAttempts: 10,
      reconnectTimeWait: 2000,
      connectTimeout: 5000,

      // Performance tuning
      pingInterval: 10000,
      maxPingOutstanding: 2,
    },
  };
};

export const getNatsSubjectPermissions = () => {
  const serviceName = process.env.SERVICE_NAME || 'unknown';

  return {
    // Service-specific subjects
    publish: [
      `${serviceName}.*`,
      `${serviceName}.>`,
    ],
    subscribe: [
      `${serviceName}.*`,
      `${serviceName}.>`,
      // Common subjects this service needs
      'system.health.*',
      'system.audit.*',
    ],
  };
};

export const validateNatsMessage = (message: any, subject: string): boolean => {
  // Basic message validation
  if (!message || typeof message !== 'object') {
    return false;
  }

  // Validate message structure
  if (!message.hasOwnProperty('data') && !message.hasOwnProperty('payload')) {
    return false;
  }

  // Check for required fields based on subject pattern
  const subjectParts = subject.split('.');
  const action = subjectParts[subjectParts.length - 1];

  // Validate specific message types
  switch (action) {
    case 'create':
    case 'update':
      return validateCreateUpdateMessage(message);
    case 'delete':
      return validateDeleteMessage(message);
    case 'read':
    case 'list':
      return validateReadMessage(message);
    default:
      return validateGenericMessage(message);
  }
};

const validateCreateUpdateMessage = (message: any): boolean => {
  const data = message.data || message.payload;
  return data && typeof data === 'object' && !data.id;
};

const validateDeleteMessage = (message: any): boolean => {
  const data = message.data || message.payload;
  return data && (data.id || data.userId || data.resourceId);
};

const validateReadMessage = (message: any): boolean => {
  const data = message.data || message.payload;
  return data && typeof data === 'object';
};

const validateGenericMessage = (message: any): boolean => {
  // Basic validation for unknown message types
  return message.data || message.payload;
};

export const addMessageMetadata = (message: any, context: any): any => {
  return {
    ...message,
    metadata: {
      timestamp: new Date().toISOString(),
      service: process.env.SERVICE_NAME || 'unknown',
      version: process.env.SERVICE_VERSION || '1.0.0',
      requestId: context.requestId || generateRequestId(),
      userId: context.userId || null,
      source: context.source || 'unknown',
    },
  };
};

const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};
