import express from 'express';
import Joi from 'joi';
import controllers from '../controllers';
import { validateBody } from '../middlewares/validate';

const router = express.Router();

const schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  code: Joi.string().required(),
});

/**
 * @openapi
 * /user/password-reset:
 *   post:
 *     summary: Reset password
 *     description: 
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
 *                  example: juffalow@juffalow.com
 *                password:
 *                  type: string
 *                  example: password
 *                code:
 *                  type: string
 *                  example: 123456
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  example: juffalow@juffalow.com
 *                password:
 *                  type: string
 *                  example: password
 *                code:
 *                  type: string
 *                  example: 123456
 *     responses:
 *       200:
 *         description: Successful response contains no data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: null
 *                 data:
 *                   type: null
 */
router.post('/', validateBody(schema), async (req: express.Request, res: express.Response , next: express.NextFunction) => {
  try {
    await controllers.User.confirmForgotPassword(req.body.username, req.body.password, req.body.code);

    res.status(200).json({
      error: null,
      data: null,
    }).end();

    next();
  } catch (err) {
    next(err);
  }
});

export default router;
