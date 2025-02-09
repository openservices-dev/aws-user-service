import express from 'express';
import Joi from 'joi';
import controllers from '../controllers';
import { validateBody } from '../middlewares/validate';

const router = express.Router();

const schema = Joi.object({
  username: Joi.string().email().required(),
});

/**
 * @openapi
 * /user/password-reset-request:
 *   post:
 *     summary: Request password reset
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
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *              example:
 *                username: juffalow@juffalow.com
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
    await controllers.User.forgotPassword(req.body.username);

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
