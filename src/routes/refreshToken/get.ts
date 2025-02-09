import express from 'express';
import Joi from 'joi';
import config from '../../config';
import controllers from '../../controllers';
import { validateCookies } from '../../middlewares/validate';

const router = express.Router();

const schema = Joi.object({
  refreshToken: Joi.string().required(),
}).unknown(true);

/**
 * @openapi
 * /user/refresh-token:
 *   get:
 *     summary: Obtain a new access token and refresh token pair
 *     description: 
 *     tags:
 *       - Refresh Token
 *     components:
 *       securitySchemes:
 *         cookieAuth:
 *           type: string
 *           in: cookie
 *           name: refreshToken
 *     security:
 *       - cookieAuth: []
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
 *                         username:
 *                           type: string
 *                         accessToken:
 *                           type: string
 *         headers:
 *           Set-Cookie:
 *             type: string
 *             description: Refresh token
 *             example: refreshToken=abc.def.ghi; Path=/; HttpOnly; Secure; Domain=example.com
 */
router.get('/', validateCookies(schema), async (req: express.Request, res: express.Response , next: express.NextFunction) => {
  try {
    const token= req.cookies.refreshToken;
    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress as string || '';

    const { user, accessToken, refreshToken } = await controllers.RefreshToken.renew(token, {
      os: req['useragent']?.os,
      browser: req['useragent']?.browser,
      ip,
    });

    res.cookie('refreshToken', refreshToken, {
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
          accessToken: accessToken,
        },
      },
    }).end();

    next();
  } catch (err) {
    next(err);
  }
});

export default router;
