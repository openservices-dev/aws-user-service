import express from 'express';
import controllers from '../controllers';
import requireAuth from '../middlewares/requireAuth';

const router = express.Router();

/**
 * @openapi
 * /user/me:
 *   get:
 *     summary: Get current user details
 *     description: 
 *     tags:
 *       - User
 *     components:
 *       securitySchemes:
 *         bearerAuth:
 *           type: http
 *           scheme: bearer
 *           bearerFormat: JWT
 *     security:
 *       - bearerAuth: []
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
 *                         meta:
 *                           type: object
 *                           example: {"name":"Matej"}
 */
router.get('/', requireAuth, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const accessToken = req.headers.authorization.replace('Bearer ', '');
    const user = await controllers.User.get(req['user']['id'], accessToken);

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
