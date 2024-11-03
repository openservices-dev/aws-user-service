import express from 'express';
import APIError from '../errors/APIError';

const router = express.Router();

router.delete('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  throw new APIError({ message: 'Unsupported operation!', code: 400 });
});

export default router;
