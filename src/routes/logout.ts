import express from 'express';
import Joi from 'joi';
import config from '../config';
import controllers from '../controllers';
import { validateCookies } from '../middlewares/validate';

const router = express.Router();

const schema = Joi.object({
  refreshToken: Joi.string().required(),
}).unknown(true);

/**
 * @openapi
 * /user/logout:
 *   post:
 *     summary: Log out user
 *     description: 
 *     tags:
 *       - User
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
 *         description: 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                 data:
 *                   type: object
 *         headers:
 *           Set-Cookie:
 *             type: string
 *             description: Refresh token
 */
router.post('/', validateCookies(schema), async (req: express.Request, res: express.Response , next: express.NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await controllers.RefreshToken.delete(refreshToken);

    res.clearCookie('refreshToken', {
      secure: config.env !== 'DEVELOPMENT',
      httpOnly: true,
      domain: config.domain,
    });

    res.status(200).json({
      error: null,
      data: null,
    }).end();
  } catch (err) {
    next(err);
  }
});

export default router;
