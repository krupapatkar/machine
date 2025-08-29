import express from "express";
import { login,verifyOtp } from "../controllers/loginController";


const router = express.Router();

router.post("/create", login);
router.post("/verify-otp", verifyOtp);

export default router;