//src\utils\sendOtp.ts

//User OTP 
import nodemailer from "nodemailer";

export const sendOtpEmail = async (emailAddress: string, otp: string, name?: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  const htmlContent = `
    <p>Hello ${name || emailAddress},</p>
    <p>Welcome to <strong>Machine</strong>! Thank you for signing up.</p>
    <p>To verify your email address and complete your registration, please use the following One-Time Password (OTP):</p>
    <h2 style="color: #1a73e8;">${otp}</h2>
    <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailAddress,
    subject: "Your OTP for Machine",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

//sendForgetPasswordOtp
export const sendForgetPasswordOtpEmail = async (
  emailAddress: string,
  otp: string,
  name?: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  const htmlContent = `
    <p>Hello ${name || emailAddress},</p>
    <p>We received a request to reset your password for <strong>Machine</strong>.</p>
    <p>Please use the following One-Time Password (OTP) to proceed with resetting your password:</p>
    <h2 style="color: #d93025;">${otp}</h2>
    <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailAddress,
    subject: "Password Reset OTP - Machine",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};
