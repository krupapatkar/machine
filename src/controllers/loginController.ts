import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Login ,VerifyOtp,LoginRequestBody} from "../types/Login";
import { LoginResponse} from "../types/User";

import { handleSuccess, handleError } from "../common/response";
import { messages } from "../common/messages";
import { now } from "../utils/day";


const prisma = new PrismaClient();

// Verify OTP
export const verifyOtp = async (req: Request<{}, {}, VerifyOtp>,res: Response): Promise<any> => {
  try {
    const { email, otp } = req.body;
     // Convert OTP to string for consistent comparison/validation
    const otpStr = String(otp);

    // ====== Required Field Blank Checks ======
        if (!email || email.trim() === "") {
          return handleError(res, null, messages.emailRequired); 
        }

        // if (!otp || otp.trim() === "") {
        //   return handleError(res, null, messages.otpRequired); 
        // }

      if (!otpStr || otpStr.trim() === "") {
      return handleError(res, null, messages.otpRequired);
    }
  
        // ====== Format Validation ======   
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          return handleError(res, null, messages.emailInvalid); 
        }

        // Validation :Basic OTP format check (e.g., 6 digits)
        const otpPattern = /^[0-9]{4,6}$/;
        if (!otpPattern.test(otp)) {
          return handleError(res, null, messages.invalidOtpFormat); 
        }

    // Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return handleError(res, null, messages.userNotFound);
    }

    // Match OTP
    // if (user.otp !== otp) {
    //   return handleError(res, null, messages.invalidOtp);
    // }

      // Match OTP
    if (user.otp !== otpStr) {
      return handleError(res, null, messages.invalidOtp);
    }

    //Check if OTP expired
    if (user.otpExpiresAt && user.otpExpiresAt < now()) {
      return handleError(res, null, messages.otpExpired);
    }
    
    // Mark user as verified
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        otpVerifiedAt: now(),
        verify: true,
      },
    });

    return handleSuccess(res, { email: updatedUser.email }, messages.otpVerified);
  } catch (error: any) {
    console.error(messages.otpVerificationError, error);
    return handleError(res, error, messages.otpVerificationError || messages.internalServerError);
  }
};

// Login API
export const login = async (req: Request<{}, {}, LoginRequestBody>,res: Response): Promise<any> => {
  try {
    const { email, userName, password } = req.body;

    // ====== Validation: Require at least email or userName ======
    if ((!email || email.trim() === "") && (!userName || userName.trim() === "")) {
      return handleError(res, null, messages.emailOrUsernameRequired);
    }

    if (!password || password.trim() === "") {
      return handleError(res, null, messages.passwordRequired);
    }

    // ====== Only validate email format if email is provided ======
    if (email && email.trim() !== "") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        return handleError(res, null, messages.emailInvalid);
      }
    }

    const loginIdentifier = email?.trim() || userName?.trim();

    // ====== Find user by email or userName ======
    const user = await prisma.user.findFirst({
      where: email
        ? { email: loginIdentifier }
        : { userName: loginIdentifier },
      include: {
        country: true,
        state: true,
        city: true,
      },
    });

    if (!user) {
      return handleError(res, null, messages.emailOrUsernameNotFound);
    }

    if (!user.verify) {
      return handleError(res, null, messages.userNotVerified);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return handleError(res, null, messages.incorrectPassword);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    const response: LoginResponse = {
      userProfile: {
        id: user.id,
        name: user.name || "",
        userName: user.userName,
        email: user.email,
        mobile: user.mobile,
        countryCode: user.countryCode,
        countryName: user.country?.name || "",
        stateName: user.state?.name || "",
        cityName: user.city?.name || "",
      },
      token,
    };

    return handleSuccess(res, response, messages.loginSuccess);
  } catch (error) {
    console.error("Login error:", error);
    return handleError(res, error, messages.internalServerError);
  }
};

// export const login = async (req: Request<{}, {}, { email: string; userName?: string;password: string }>, res: Response): Promise<any> => {
//   try {
//     const { email,userName,password } = req.body;

//     // ====== Required Field Blank Checks ======
//       // ====== Validation ======
//     if ((!email || email.trim() === "") && (!userName || userName.trim() === "")) {
//       return handleError(res, null, messages.emailOrUsernameRequired);
//     }
//     // if (!email || email.trim() === "") {
//     //   return handleError(res, null, messages.emailRequired);
//     // }


//     if (!password || password.trim() === "") {
//       return handleError(res, null, messages.passwordRequired);
//     }

//     // ====== Format Validation ======
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(email)) {
//       return handleError(res, null, messages.emailInvalid);
//     }

//     // ====== Fetch User with Relations ======
//     const user = await prisma.user.findUnique({
//       where: { email },
//       include: {
//         country: true,
//         state: true,
//         city: true,
//       },
//     });

//     if (!user) {
//       return handleError(res, null, messages.emailOrUsernameNotFound);
//       //return handleError(res, null, messages.emailNotFound);
//     }

//     // ====== Check if User is Verified ======
//     if (!user.verify) {
//       return handleError(res, null, messages.userNotVerified);
//     }

//     // ====== Compare Password ======
//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       return handleError(res, null, messages.incorrectPassword);
//     }

//     // ====== Generate Token ======
//     const token = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET || "default_secret",
//       { expiresIn: "1h" }
//     );

//     // ====== Format Response ======
//     const response: LoginResponse = {
//       userProfile: {
//         id: user.id,
//         name: user.name || "",
//         userName: user.userName,
//         email: user.email,
//         mobile: user.mobile,
//         countryCode: user.countryCode,
//         countryName: user.country?.name || "",
//         stateName: user.state?.name || "",
//         cityName: user.city?.name || "",
//         //created_at: user.createdAt.toISOString(),
//         //updated_at: user.updatedAt.toISOString(),                                  
        
//       },
//       token,
//     };

//     return handleSuccess(res, response, messages.loginSuccess);
//   } catch (error) {
//     console.error("Login error:", error);
//     return handleError(res, error, messages.internalServerError);
//   }
// };
// export const login = async (req: Request<{}, {}, Login>, res: Response): Promise<any> => {
//   try {
//     const { email, password } = req.body;

//        // ====== Required Field Blank Checks ======
//         if (!email || email.trim() === "") {
//           return handleError(res, null, messages.emailRequired); 
//         }

//         if (!password || password.trim() === "") {
//           return handleError(res, null, messages.passwordRequired); 
//         }

//         // ====== Format Validation ======
//         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailPattern.test(email)) {
//           return handleError(res, null, messages.emailInvalid); 
//         }

//     // Find user and include related tables
//         const user = await prisma.user.findUnique({
//           where: { email },
//           include: {
//             country: true,
//             state: true,
//             city: true,
//           },
//           });

//     if (!user || !user.verify) {
//       return handleError(res, null, messages.invalidEmailPasswordOrNotVerified);
//     }

//     // Check password
//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       return handleError(res, null, messages.invalidEmailOrPassword);
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user.id, email_address: user.email },
//       process.env.JWT_SECRET || "default_secret",
//       { expiresIn: "1h" }
//     );
//         const response: LoginResponse = {
//           userProfile: {
//             id: user.id,
//             name: user.name || "",
//             userName: user.userName,
//             email: user.email,
//             //password: user.password,
//             mobile: user.mobile,
//             countryCode: user.countryCode,
//             countryName: user.country?.name || "", 
//             stateName: user.state?.name || "",    
//             cityName: user.city?.name || "",      
//             created_at: user.createdAt.toISOString(),
//             updated_at: user.updatedAt.toISOString(),
//           },
//           token,
//         };

//     return handleSuccess(res, response, messages.loginSuccess);
//   } catch (error) {
//     console.error("Login error:", error);
//     return handleError(res, error, messages.internalServerError);
//   }
// };


// export const login = async (req: Request<{}, {}, Login>, res: Response): Promise<any> => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return handleError(res, null, messages.emailAndPasswordRequired);
//     }

//     // Find user
//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user || !user.verify) {
//       return handleError(res, null, messages.invalidEmailPasswordOrNotVerified);
//     }

//     // Check password
//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       return handleError(res, null, messages.invalidEmailOrPassword);
//     }

//     // Generate token
//       const token = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET || "default_secret",
//       { expiresIn: "1h" } 
//     );
//     const response: LoginResponse = {
//       email: user.email,
//       password: user.password, // hashed password
//       token,
//     };

//     // Send success response
//     return handleSuccess(res, response, messages.loginSuccess);
//   } catch (error) {
//     console.error("Login error:", error);
//     return handleError(res, error, messages.internalServerError);
//   }
// };



