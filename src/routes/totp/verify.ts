import express from 'express';
import controllers from '../../controllers';
import requireAuth from '../../middlewares/requireAuth';

const router = express.Router();

/**
 * @openapi
 * /user/topt/verify:
 *   post:
 *     summary: Verify TOTP code
 *     description: 
 *     tags:
 *       - MFA
 *     requestBody:
 *       content:
 *          application/x-www-form-urlencoded:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                code:
 *                  type: string
 *                  example: 123456
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                  example: juffalow@juffaliow.com
 *                code:
 *                  type: string
 *                  example: 123456
 *     responses:
 *       200:
 *         description: Returns secret code and QR code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                 data:
 *                   type: object
 */
router.post('/', requireAuth, async (req: express.Request, res: express.Response , next: express.NextFunction) => {
  try {
    const accessToken = req.headers.authorization.replace('Bearer ', '');
    await controllers.User.verifyMFA(req.body.username, req.body.code, accessToken, null);

    res.status(200).json({
      error: null,
      data: {
        
      },
    }).end();
  } catch (err) {
    next(err);
  }
});

export default router;
