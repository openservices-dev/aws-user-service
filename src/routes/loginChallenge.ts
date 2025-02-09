import express from 'express';
import Joi from 'joi';
import config from '../config';
import controllers from '../controllers';
import { validateBody } from '../middlewares/validate';

const router = express.Router();

const schema = Joi.object({
  username: Joi.string().email().required(),
  code: Joi.string().required(),
  session: Joi.string().required(),
});

router.post('/', validateBody(schema), async (req: express.Request, res: express.Response , next: express.NextFunction) => {
  try {

    const { user, refreshToken, accessToken } = await controllers.User.respondToChallenge(req.body.username, req.body.code, req.body.session);
    
    typeof refreshToken !== 'undefined' && res.cookie('refreshToken', refreshToken, {
      secure: config.env !== 'DEVELOPMENT',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      domain: config.domain,
    });

    res.status(200).json({
      error: null,
      data: {
        user: {
          ...user,
          accessToken,
        },
      },
    }).end();

    next();
  } catch (err) {
    next(err);
  }
});

export default router;
