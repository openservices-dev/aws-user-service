import { Request, Response, NextFunction } from 'express';
import APIError from '../errors/APIError';
import logger from '../logger';
import namespace from '../services/cls';

export default function error(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof APIError) {
    res.status(err.code).header('x-user-requestid', namespace.get('traceId')).json({
      error: {
        message: err.message,
      },
      data: null,
    }).end();
  } else {
    logger.error('Something went wrong!', { error: { message: err.message, stack: err.stack } });

    res.status(500).header('x-user-requestid', namespace.get('traceId')).json({
      error: {
        message: 'Something went wrong!',
      },
      data: null,
    }).end();
  }

  return;
}
