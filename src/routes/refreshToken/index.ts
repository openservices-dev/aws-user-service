import express from 'express';
import get from './get';

const router = express.Router();

router.use('/', get);

export default router;