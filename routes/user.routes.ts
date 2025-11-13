import express from "express";
import { addUser, sendOtp, verifyUser } from "../controllers/user.controller";

const router = express.Router();

router.post("/register", addUser);
router.post("/sendotp", sendOtp);
router.post("/verify", verifyUser);

export default router;
