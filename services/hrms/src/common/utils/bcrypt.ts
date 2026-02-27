import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

export const hashValue = async (value: string, saltRounds = 10) =>
  bcrypt.hash(value, saltRounds);

export const compareValue = async (value: string, hashedValue: string) =>
  bcrypt.compare(value, hashedValue);

export const generateDeviceHash = (userAgent: string): string => {
  if (userAgent.includes('PostmanRuntime')) {
    return createHash('sha256').update('Postman').digest('hex');
  }
  return createHash('sha256').update(userAgent).digest('hex');
};
