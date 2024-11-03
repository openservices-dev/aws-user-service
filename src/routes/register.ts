import express from 'express';
import Joi from 'joi';
import controllers from '../controllers';
import { validateBody } from '../middlewares/validate';

const router = express.Router();

const schema = Joi.object({
  username: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  meta: Joi.object().optional(),
});

/**
 * @openapi
 * /user/register:
 *   post:
 *     summary: Create a user
 *     description: New user is not active immediately. User needs to confirm email address before being able to log in.
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
 *                meta:
 *                  type: object
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                password:
 *                  type: string
 *                meta:
 *                  type: object
 *              example:
 *                username: juffalow@juffalow.com
 *                password: password
 *                meta: {"name":"Matej"}
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
 *                           description: User ID can be either string (UUID) or number
 *                         email:
 *                           type: string
 */
router.post('/', validateBody(schema), async (req: express.Request, res: express.Response , next: express.NextFunction) => {
  try {
    const data = req.body;
    const user = await controllers.User.signUp(data.username, data.password, data.meta);

    res.status(200).json({
      error: null,
      data: {
        user,
      },
    }).end();
  } catch (err) {
    next(err);
  }
});

export default router;
