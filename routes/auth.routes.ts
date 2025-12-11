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

router.post("/sendotp", sendOtp);
router.post("/verify", verifyUser);
router.get("/refresh", refreshAccessToken);
router.get("/session", isAuthenticatedUser, getSession);
router.put("/scope", isAuthenticatedUser, setUserScope);

router.route("/password/set").post(isAuthenticatedUser, setPassword);
router.route("/login").post(signInUsingPassword);
router.route("/password/change").put(isAuthenticatedUser, changePassword);

export default router;
