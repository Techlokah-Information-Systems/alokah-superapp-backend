import {
  addSecret,
  createAlokahUser,
  verifyOtp,
} from "../controllers/alokah.controller";
import router from "./route";

router.post("/add-secret", addSecret);

router.route("/add-user").post(createAlokahUser);
router.route("/verify-otp").post(verifyOtp);

export default router;
