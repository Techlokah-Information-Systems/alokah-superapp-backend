import express from "express";
import {
  sendOtp,
  verifyUser,
  refreshAccessToken,
} from "../controllers/auth.controller";

const router = express.Router();
router.post("/sendotp", sendOtp);
router.post("/verify", verifyUser);
router.get("/refresh", refreshAccessToken);

export default router;
