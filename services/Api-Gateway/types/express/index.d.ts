import { Response } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
      user?: any;
    }
    interface Response extends Response {}
  }