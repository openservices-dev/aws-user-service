import express from 'express';
import controllers from '../../controllers';
import requireAuth from '../../middlewares/requireAuth';

const router = express.Router();

/**
 * @openapi
 * /user/topt/setup:
 *   post:
 *     summary: Setup MFA for a user
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
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
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
 *                   properties:
 *                     message:
 *                       type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     otp:
 *                       type: object
 *                       properties:
 *                         secretCode:
 *                           type: string
 *                         qrCode:
 *                           type: string
 */
router.post('/', requireAuth, async (req: express.Request, res: express.Response , next: express.NextFunction) => {
  try {
    const accessToken = req.headers.authorization.replace('Bearer ', '');
    const { secretCode } = await controllers.User.setupMFA(req.body.username, accessToken) as any;

    const authUrl = `otpauth://totp/${req.body.username}?secret=${secretCode}`;
    
    res.status(200).json({
      error: null,
      data: {
        otp: {
          authUrl,
          secretCode,
        },
      },
    }).end();
  } catch (err) {
    next(err);
  }
});

export default router;
