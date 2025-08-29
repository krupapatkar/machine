// src/controllers/userController.ts
import { PrismaClient, User as PrismaUser } from "@prisma/client";
import { Request, Response } from "express";
import { User,UserProfile,SignupResponse,GetUserResponse,EditUserResponse} from "../types/User";
import { Pagination, PaginatedResponse } from "../types/Common";
import { handleSuccess, handleError } from "../common/response";
import { messages  } from "../common/messages";
import { generateOTP } from "../utils/day";
import { sendOtpEmail } from "../utils/sendOtp";
import { now,getOtpExpiry  } from "../utils/day";
import {validateRequiredField,validateUserInputFormat,validateUniqueIdFormat, validateEmail, validateCountryCode ,validatePassword             
  ,validateLocationIdsExist,checkUserExistsByEmailOrUsername,validateMobile  } from "../utils/validateUser";


const prisma = new PrismaClient();

import bcrypt from "bcrypt";

// Create user with OTP
export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const userData: User = req.body;

    // ====== Required Field Checks ======
    const requiredFields = [
      "name", "userName", "email", "password", "mobile",
      "countryCode", "countryId", "stateId", "cityId"
    ];
    for (const field of requiredFields) {
      if (await validateRequiredField(field, (userData as any)[field], res)) return;
    }

  
    // ====== Format Validation ======
    validateUserInputFormat(userData, res);
    
      // UUID Format Checks
      validateCountryCode(userData.countryCode, res);
      validateEmail(userData.email, res);
      validateUniqueIdFormat(userData.countryId!, "countryId", res);
      validateUniqueIdFormat(userData.stateId!, "stateId", res);
      validateUniqueIdFormat(userData.cityId!, "cityId", res);
      validateMobile(userData.mobile, res);
      // ====== Password Strength Check ======
      validatePassword(userData.password, res);

   
    // ====== DB Existence Check ======
        if (userData.countryId &&userData.stateId &&userData.cityId) {
          await validateLocationIdsExist(
            userData.countryId,userData.stateId,userData.cityId,res); 
          }

    // ====== Uniqueness Check ======
        if (
      !(await checkUserExistsByEmailOrUsername(
        userData.email,userData.userName,res))) {}

    // ====== Hash Password & Generate OTP ======
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const otp = generateOTP();

    const userPayload: User = {
      ...userData,
      password: hashedPassword,
      otp,
      otpCreatedAt: new Date(),
      otpExpiresAt: getOtpExpiry(5),
      otpCount: 1,
    };

    const createdUser = await prisma.user.create({
      data: userPayload,
      include: {
        country: true,
        state: true,
        city: true,
      },
    });

    await sendOtpEmail(createdUser.email, otp);

    // ====== Format Response ======
    const response: SignupResponse = {
      userProfile: {
        id: createdUser.id,
        name: createdUser.name || "",
        userName: createdUser.userName,
        email: createdUser.email,
        mobile: createdUser.mobile || "",
        countryCode: createdUser.countryCode || "",
        countryName: createdUser.country?.name || "",
        stateName: createdUser.state?.name || "",
        cityName: createdUser.city?.name || "",
        otp: createdUser.otp || "",
      },
    };

    return handleSuccess(res, response, messages.userCreateSuccess);
  } catch (error: any) {
    return handleError(res, error, messages.userCreateError);
  }
};

 // Validate mobile number
    //isValidMobile(userData.mobile, "mobile", res);
      // UUID Format Checks
    // if (!isUUID(userData.countryId!, "countryId", res)) return;
    // if (!isUUID(userData.stateId!, "stateId", res)) return;
    // if (!isUUID(userData.cityId!, "cityId", res)) return;
  // if (!isUUID(userData.countryId!)) {
    //   handleError(res, null, messages.invalidCountryIdFormat);
    // }
    // if (!isUUID(userData.stateId!)) {
    //   handleError(res, null, messages.invalidStateIdFormat);
    // }
    // if (!isUUID(userData.cityId!)) {
    //   handleError(res, null, messages.invalidCityIdFormat);
    // }

   // if (!isValidMobile(userData.mobile)) {
      //   handleError(res, null, messages.mobileInvalid);
      // }

//Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        country: true,
        state: true,
        city: true,
      },
    });

    if (!user) {
      return handleError(res, null, messages.userIDNotFound);
    }
        //Format response using GetUserResponse interface
        const formatted: GetUserResponse = {
        userProfile: {
        id: user.id,
        name: user.name || "",
        userName: user.userName,
        email: user.email,
        mobile: user.mobile || "",
        countryCode: user.countryCode || "",
        countryName: user.country?.name || "",
        stateName: user.state?.name || "",
        cityName: user.city?.name || "", 
        otp: user.otp || ""
      },
    };
    return handleSuccess(res, formatted, messages.userFetchSuccess);
  } catch (error: any) {
    return handleError(res, error, messages.userFetchError);
  }
};

// Edit user by ID
export const editUser = async (req: Request<{ id: string }, {}, User>,res: Response): Promise<any> => {
  try {
    const userId = req.params.id;
    const body: User = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return handleError(res, null, messages.userIDNotFound);
    }

    // ====== Required Field Checks ======
    const requiredFields = [
      "name", "userName", "mobile", "countryCode", "countryId", "stateId", "cityId"
    ];
    for (const field of requiredFields) {
      if (await validateRequiredField(field, (body as any)[field], res)) return;
    }

    // // ====== Format Validation ======
    // if (!validateUserInputFormat(body, res)) return;

    // // ====== Validate UUID Format ======
    // if (!isUUID(body.countryId as string)) {
    //   return handleError(res, null, messages.invalidCountryIdFormat);
    // }
    // if (!isUUID(body.stateId as string)) {
    //   return handleError(res, null, messages.invalidStateIdFormat);
    // }
    // if (!isUUID(body.cityId as string)) {
    //   return handleError(res, null, messages.invalidCityIdFormat);
    // }

    // ====== Username Uniqueness Check ======
    const trimmedUserName = body.userName?.trim();
    const existingUserWithUserName = await prisma.user.findFirst({
      where: {
        userName: {
          equals: trimmedUserName,
          mode: "insensitive",
        },
        NOT: {
          id: userId,
        },
      },
    });

    if (existingUserWithUserName) {
      return handleError(res, null, messages.userNameAlreadyExists);
    }

    // ====== DB Location Existence Check ======
    if (
      !(await validateLocationIdsExist(
        body.countryId as string,
        body.stateId as string,
        body.cityId as string,
        res
      ))
    ) return;

    // ====== Optional Password Update ======
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    // ====== Update User ======
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        userName: trimmedUserName,
        mobile: body.mobile,
        countryCode: body.countryCode,
        countryId: body.countryId,
        stateId: body.stateId,
        cityId: body.cityId,
        updatedBy: body.updatedBy || userId,
      },
      include: {
        country: true,
        state: true,
        city: true,
      },
    });

    // ====== Format Response ======
    const userProfile: UserProfile = {
      id: updatedUser.id,
      name: updatedUser.name || "",
      userName: updatedUser.userName,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      countryCode: updatedUser.countryCode,
      countryName: updatedUser.country?.name || "",
      stateName: updatedUser.state?.name || "",
      cityName: updatedUser.city?.name || "",
    };

    const response: EditUserResponse = {
      userProfile,
    };

    return handleSuccess(res, response, messages.userEditSuccess);
  } catch (error: any) {
    return handleError(res, error, messages.userEditError);
  }
};


// ====== Edit User By ID ======
// export const editUser = async (req: Request<{ id: string }, {}, User>, res: Response): Promise<any> => {
//   try {
//     const userId = req.params.id;
//     const body: User = req.body;

//     // Check if user exists
//     const existingUser = await prisma.user.findUnique({ where: { id: userId } });
//     if (!existingUser) {
//       return handleError(res, null, messages.userIDNotFound);
//     }
//     // ====== Required Field Blank Checks ======
   
//         if (!body.name || body.name.trim() === "") {
//         return handleError(res, null, messages.nameRequired);
//         }
//       if (!body.userName || body.userName.trim() === "") {
//         return handleError(res, null, messages.usernameRequired);
//         }
      
//        if (!body.mobile || body.mobile.trim() === "") {
//         return handleError(res, null, messages.mobileRequired);
//       }

//       if (!body.countryCode  || body.name.trim() === "") {
//         return handleError(res, null, messages.countryCodeRequired);
//       }

//       if (!body.countryId || body.countryId.trim() === "") {
//         return handleError(res, null, messages.countryID);
//       }
//       if (!body.stateId || body.stateId.trim() === "") {
//         return handleError(res, null, messages.stateID);
//       }
//       if (!body.cityId || body.cityId.trim() === "") {
//         return handleError(res, null, messages.cityID);
//       }

//       // ====== Format Validation ======
//       const mobilePattern = /^[0-9]{10}$/;
//       if (!mobilePattern.test(body.mobile)) {
//         return handleError(res, null, messages.mobileInvalid);
//       }
//       const trimmedUserName = body.userName?.trim();

//       console.log("User ID:", userId);
//       console.log("New Username:", body.userName.trim());

//         // ====== Username Check (case-insensitive) ======
//         const existingUserWithUserName = await prisma.user.findFirst({
//           where: {
//             userName: {
//               equals: trimmedUserName,
//               mode: "insensitive", 
//             },
//             NOT: {
//               id: userId,
//             },
//           },
//         });

//         console.log("Duplicate Found:", existingUserWithUserName);

//         if (existingUserWithUserName) {
//           return handleError(res, null, messages.userNameAlreadyExists);
//         }


//       const countryCodePattern = /^\+\d{1,4}$/;
//         if (!countryCodePattern.test(body.countryCode)) {
//           return handleError(res, null, messages.invalidCountryCodeFormat);
//         }
//       const isUUID = (val: string) =>
//         /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(val);

//       if (!isUUID(body.countryId)) return handleError(res, null, messages.invalidCountryIdFormat);
//       if (!isUUID(body.stateId)) return handleError(res, null, messages.invalidStateIdFormat);
//       if (!isUUID(body.cityId)) return handleError(res, null, messages.invalidCityIdFormat);

//       // ====== DB Existence Checks ======
//       const [country, state, city] = await Promise.all([
//         prisma.country.findUnique({ where: { id: body.countryId } }),
//         prisma.state.findUnique({ where: { id: body.stateId } }),
//         prisma.city.findUnique({ where: { id: body.cityId } }),
//       ]);

//       if (!country) return handleError(res, null, messages.countryIDNotFound);
//       if (!state) return handleError(res, null, messages.stateIDNotFound);
//       if (!city) return handleError(res, null, messages.cityIDNotFound);

//     // Validate related location IDs
//     const validations: Array<{
//       id: string | undefined;
//       type: "country" | "state" | "city";
//       message: string;
//     }> = [
//       { id: body.countryId, type: "country", message: messages.countryIdNotFound },
//       { id: body.stateId, type: "state", message: messages.stateIDNotFound },
//       { id: body.cityId, type: "city", message: messages.cityIDNotFound },
//     ];
//           for (const { id, type, message } of validations) {
//         if (!id) continue;

//         let exists = null;

//         if (type === "country") {
//           exists = await prisma.country.findUnique({ where: { id } });
//         } else if (type === "state") {
//           exists = await prisma.state.findUnique({ where: { id } });
//         } else if (type === "city") {
//           exists = await prisma.city.findUnique({ where: { id } });
//         }

//         if (!exists) return handleError(res, null, message);
//       }
//           // Hash password if passed (you may skip this entirely)
//           if (body.password) {
//             body.password = await bcrypt.hash(body.password, 10);
//           }

//     //Update allowed fields
//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         name: body.name,
//         userName: body.userName,
//         mobile: body.mobile,
//         countryCode: body.countryCode,
//         countryId: body.countryId,
//         stateId: body.stateId,
//         cityId: body.cityId,
//         updatedBy: body.updatedBy || userId,
//       },
//       include: {
//         country: true,
//         state: true,
//         city: true,
//       },
//     });

//       // Prepare formatted response
//         const userProfile: UserProfile  = {
//         id: updatedUser.id,
//         name: updatedUser.name || "",
//         userName: updatedUser.userName,   
//         email: updatedUser.email,        
//         mobile: updatedUser.mobile,
//         countryCode: updatedUser.countryCode,
//         countryName: updatedUser.country?.name || "",
//         stateName: updatedUser.state?.name || "",
//         cityName: updatedUser.city?.name || "",
//       };

//     const formatted: EditUserResponse = {
//       userProfile,
//     };

//     return handleSuccess(res, formatted, messages.userEditSuccess);
//   } catch (error: any) {
//     return handleError(res, error, messages.userEditError);
//   }
// };


// export const editUser = async (req: Request<{ id: string }, {}, User>,res: Response): Promise<any> => {
//   try {
//     const userId = req.params.id;
//     const body: User = req.body;

//     // Check if user exists
//     const existingUser = await prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!existingUser) {
//       return handleError(res, null, messages.userIDNotFound);
//     }

//     // Validate related IDs (country/state/city)
//     const validations: Array<{
//       id: string | undefined;
//       type: "country" | "state" | "city";
//       message: string;
//     }> = [
//       { id: body.countryId, type: "country", message: messages.countryIdNotFound },
//       { id: body.stateId, type: "state", message: messages.stateIDNotFound },
//       { id: body.cityId, type: "city", message: messages.cityIDNotFound },
//     ];

//     for (const { id, type, message } of validations) {
//       if (!id) continue;
//       let exists = null;

//       if (type === "country") {
//         exists = await prisma.country.findUnique({ where: { id } });
//       } else if (type === "state") {
//         exists = await prisma.state.findUnique({ where: { id } });
//       } else if (type === "city") {
//         exists = await prisma.city.findUnique({ where: { id } });
//       }

//       if (!exists) return handleError(res, null, message);
//     }

//     //Hash password if updated
//     if (body.password) {
//       body.password = await bcrypt.hash(body.password, 10);
//     }

//     // Update user
//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         name: body.name,
//         userName: body.userName,
//         email: body.email,
//         mobile: body.mobile,
//         countryCode: body.countryCode,
//         countryId: body.countryId,
//         stateId: body.stateId,
//         cityId: body.cityId,
//         // otp: body.otp,
//       },
//       include: {
//         country: true,
//         state: true,
//         city: true,
//       },
//     });

//         //Format response using EditUserResponse interface
//           const userProfile: UserProfile = {
//           id: updatedUser.id,
//           name: updatedUser.name || "",
//           userName: updatedUser.userName,
//           email: updatedUser.email,
//           mobile: updatedUser.mobile || "",
//           countryCode: updatedUser.countryCode || "",
//           countryName: updatedUser.country?.name || "",
//           stateName: updatedUser.state?.name || "",
//           cityName: updatedUser.city?.name || "",
//         };

//         const formatted: EditUserResponse = {
//           userProfile,
//         };

//     return handleSuccess(res, formatted, messages.userEditSuccess);
//   } catch (error: any) {
//     return handleError(res, error, messages.userEditError);
//   }
// };

// Delete user by ID

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.params.id;

    //Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return handleError(res, null, messages.userIDNotFound); // ⬅ Custom not found message
    }

    //Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return handleSuccess(res, null, messages.userDeleted);
  } catch (error) {
    return handleError(res, error, messages.userDeleteError);
  }
};

