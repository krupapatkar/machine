//src\controllers\PasswordController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import { ForgetPassword,ResetPassword} from "../types/Password";
import { handleSuccess, handleError } from "../common/response";
import { messages } from "../common/messages";
import { sendForgetPasswordOtpEmail } from "../utils/sendOtp";
import { generateOTP,now } from "../utils/day";
import { VerifyOtp} from "../types/Login";

const prisma = new PrismaClient();

// Forget Password
export const forgetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email }: ForgetPassword = req.body;

    if (!email) {
      return handleError(res, null, messages.emailRequired);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return handleError(res, null, messages.emailNotFound);
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiresAt,
        otpCount: (user.otpCount || 0) + 1,
      },
    });

    await sendForgetPasswordOtpEmail(email, otp, user.name || undefined);
      const response: VerifyOtp = {
      email,
      otp,
    };
    return handleSuccess(res, response, messages.otpSentSuccess);
  } catch (err) {
    console.error(messages.emailOtpError, err);
    return handleError(res, err, messages.emailOtpError);
  }
};

//Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, newPassword, confirmPassword }: ResetPassword = req.body;

    // ====== Required Field Blank Checks ======
    if (!email || email.trim() === "") {
      return handleError(res, null, messages.emailRequired);
    }
    if (!newPassword || newPassword.trim() === "") {
      return handleError(res, null, messages.newPasswordRequired);
    }
    if (!confirmPassword || confirmPassword.trim() === "") {
      return handleError(res, null, messages.confirmPasswordRequired);
    }

    // ====== Format Validation ======
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return handleError(res, null, messages.emailInvalid);
    }

    // ====== Password Match Check ======
    if (newPassword !== confirmPassword) {
      return handleError(res, null, messages.passwordsDoNotMatch);
    }

    // ====== Password Strength Check (Optional: 6 chars min) ======
    if (newPassword.length < 6) {
      return handleError(res, null, messages.passwordTooShort); // Optional rule
    }

    // ====== Check if User Exists ======
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return handleError(res, null, messages.emailNotFound);
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update the password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });
        // Response
        const response = {
        email: updatedUser.email,
        //updated_at: updatedUser.updatedAt,
      };

    return handleSuccess(res, response, messages.passwordResetSuccess);
      } catch (error) {
        console.error(messages.resetPasswordError, error);
        return handleError(res, error, messages.passwordResetError);
      
      }
    };


