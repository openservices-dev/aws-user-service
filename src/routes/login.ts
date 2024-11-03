import express from 'express';
import Joi from 'joi';
import config from '../config';
import controllers from '../controllers';
import { validateBody } from '../middlewares/validate';

const router = express.Router();

const schema = Joi.object({
  username: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * @openapi
 * /user/login:
 *   post:
 *     summary: Log in a user
 *     description: Get basic user data with `accessToken` and `refreshToken` is returned in cookie.
 *     tags:
 *       - User
 *     requestBody:
 *       content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  required: true
 *                password:
 *                  type: string
 *                  required: true
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  required: true
 *                password:
 *                  type: string
 *                  required: true
 *     responses:
 *       200:
 *         description: Successful response user ID, email and access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           oneOf:
 *                             - type: string
 *                             - type: number
 *                         email:
 *                           type: string
 *                         accessToken:
 *                           type: string
 *         headers:
 *           Set-Cookie:
 *             type: string
 *             description: Refresh token
 *             example: refreshToken=abc.def.ghi; Path=/; HttpOnly; Secure; Domain=example.com
 *       400:
 *         description: Wrong username or password or user is not verified / confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [NotAuthorizedException, UserNotConfirmedException, UnknownException]
 *                 data:
 *                   type: object
 */
router.post('/', validateBody(schema), async (req: express.Request, res: express.Response , next: express.NextFunction) => {
  try {
    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress as string || '';
    const data = req.body;
    const { user, refreshToken, accessToken, session } = await controllers.User.signIn(
      data.username,
      data.password,
      {
        ip,
        os: req['useragent']?.os,
        browser: req['useragent']?.browser,
      },
    );

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
          session,
        },
      },
    }).end();
  } catch (err) {
    next(err);
  }
});

export default router;
