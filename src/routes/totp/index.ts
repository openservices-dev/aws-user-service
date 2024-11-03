import express from 'express';
import setup from './setup';
import verify from './verify';

const router = express.Router();

router.use('/setup', setup);
router.use('/verify', verify);

export default router;
