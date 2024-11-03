import express from 'express';
import refreshToken from './refreshToken';
import register from './register';
import confirm from './confirm';
import login from './login';
import loginChallenge from './loginChallenge';
import logout from './logout';
import passwordResetRequest from './passwordResetRequest';
import passwordReset from './passwordReset';
import totp from './totp';
import me from './me';
import swagger from './swagger';

const router = express.Router();

router.use('/refresh-token', refreshToken);
router.use('/register', register);
router.use('/confirm', confirm);
router.use('/login', login);
router.use('/login/challenge', loginChallenge);
router.use('/logout', logout);
router.use('/password-reset-request', passwordResetRequest);
router.use('/password-reset', passwordReset);
router.use('/totp', totp);
router.use('/me', me);

process.env.ENV === 'DEVELOPMENT' && router.use('/', swagger);

export default router;
