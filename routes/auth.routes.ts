import router from "./user.routes";
import {
  sendOtp,
  verifyUser,
  refreshAccessToken,
  setPassword,
  signInUsingPassword,
  changePassword,
  getSession,
  setUserScope,
} from "../controllers/auth.controller";
import { isAuthenticatedUser } from "../middleware/authenticate";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /auth/sendotp:
 *   post:
 *     summary: Send OTP
 *     description: Sends an OTP to the provided email or phone number.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 */
router.post("/sendotp", sendOtp);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify OTP
 *     description: Verifies the OTP sent to the user.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post("/verify", verifyUser);

router.get("/refresh", refreshAccessToken);
router.get("/session", isAuthenticatedUser, getSession);
router.put("/scope", isAuthenticatedUser, setUserScope);

router.route("/password/set").post(isAuthenticatedUser, setPassword);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with Password
 *     description: Authenticate user using password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.route("/login").post(signInUsingPassword);
router.route("/password/change").put(isAuthenticatedUser, changePassword);

export default router;
