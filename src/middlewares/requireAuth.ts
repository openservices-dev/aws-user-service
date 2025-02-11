import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/APIError';
import services from '../services';

export default async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if ('authorization' in req.headers === false) {
    return next(new UnauthorizedError('Unauthorized!', 401));
  }
  
  const token = req.headers.authorization.replace('Bearer ', '');

  try {
    const payload = services.Token.verify(token);
  
    const data = payload instanceof Promise ? await payload : payload;

    req['user'] = data;

    next();
  } catch (err) {
    next(new UnauthorizedError('Unauthorized!', 401));
  }
}
