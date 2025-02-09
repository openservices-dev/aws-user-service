import express from 'express';
import Joi from 'joi';
import controllers from '../controllers';
import { validateBody } from '../middlewares/validate';

const router = express.Router();

const schema = Joi.object({
  username: Joi.string().required(),
  code: Joi.string().length(6).required(),
});

/**
 * @openapi
 * /user/confirm:
 *   post:
 *     summary: Confirm user registration
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
 *                code:
 *                  type: string
 *                  example: 123456
 *     responses:
 *       200:
 *         description: User detail
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
 *                           description: User ID can be either string (UUID) or number
 *                         email:
 *                           type: string
 */
router.post('/', validateBody(schema), async (req: express.Request, res: express.Response , next: express.NextFunction) => {
  try {
    const data = req.body;
    const user = await controllers.User.confirmSignUp(data.username, data.code);

    res.status(200).json({
      error: null,
      data: {
        user,
      },
    }).end();

    next();
  } catch (err) {
    next(err);
  }
});

export default router;
