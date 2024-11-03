import express from 'express';
import { BaseError } from '../utils/errors';

const router = express.Router();

router.delete('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  throw new BaseError({ message: 'Unsupported operation!', code: 400 });
});

export default router;
