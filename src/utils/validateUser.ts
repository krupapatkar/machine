//utils\validateUserInput.ts
import { Response } from "express";
import { messages } from "../common/messages";
import { handleError } from "../common/response";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Generic required field check


//
// ===== Required Field Check =====
//
const validateRequiredField = async (fieldName: string,value: any,res: Response): Promise<boolean> => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    const messageMap: Record<string, string> = {
      name: messages.nameRequired,
      userName: messages.usernameRequired,
      email: messages.emailRequired,
      password: messages.passwordRequired,
      mobile: messages.mobileRequired,
      countryCode: messages.countryCodeRequired,
      countryId: messages.countryID,
      stateId: messages.stateID,
      cityId: messages.cityID,
    };

    const message = messageMap[fieldName] || `Field ${fieldName} is required`;
    handleError(res, null, message);
    return true;
  }
  return false;
};
// ==================== EMAIL ====================
export const validateEmail = (email: string, res: Response): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return handleError(res, null, messages.emailInvalid), false;
  }
  return true;
};

// ==================== Unique ID Format ====================
export const validateUniqueIdFormat = (value: string, fieldName: string, res: Response): boolean => {
  const uniqueIdPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  if (!uniqueIdPattern.test(value)) {
    const messageMap: Record<string, string> = {
      countryId: messages.invalidCountryIdFormat,
      stateId: messages.invalidStateIdFormat,
      cityId: messages.invalidCityIdFormat,
    };
    const msg = messageMap[fieldName] || `${messages.invalidUniqueIdFormat}, ${fieldName}`;
    //const msg = messageMap[fieldName] || `Invalid Unique ID format for ${fieldName}`;
    return handleError(res, null, msg), false;
  }
  return true;
};

// ==================== COUNTRY CODE ====================
export const validateCountryCode = (code: string, res: Response): boolean => {
  const codePattern = /^\+\d{1,4}$/;
  if (!codePattern.test(code)) {
    return handleError(res, null, messages.invalidCountryCodeFormat), false;
  }
  return true;
};

// ==================== MOBILE NUMBER ====================
export const validateMobile = (mobile: string, res: Response): boolean => {
  const mobilePattern = /^\d{10}$/;
  if (!mobilePattern.test(mobile)) {
    return handleError(res, null, messages.mobileInvalid), false;
  }
  return true;
};

// ==================== PASSWORD ====================
export const validatePassword = (password: string, res: Response): boolean => {
   if (password.length < 6) {
    handleError(res, null, messages.passwordTooShort);
    return false;
  }
  return true;
};



export const validateUserInputFormat = (userData: any, res: Response): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(userData.email)) {
    handleError(res, null, messages.emailInvalid);
    return false;
  }

  if (userData.countryId && !validateUniqueIdFormat(userData.countryId, "countryId", res)) {
    return false;
  }

  if (userData.stateId && !validateUniqueIdFormat(userData.stateId, "stateId", res)) {
    return false;
  }

  if (userData.cityId && !validateUniqueIdFormat(userData.cityId, "cityId", res)) {
    return false;
  }

  const countryCodePattern = /^\+\d{1,4}$/;
  if (!countryCodePattern.test(userData.countryCode)) {
    handleError(res, null, messages.invalidCountryCodeFormat);
    return false;
  }

  return true;
};

// ===== DB Location (country/state/city) Existence Check =====
const validateLocationIdsExist = async (countryId: string,stateId: string,cityId: string,res: Response): Promise<boolean> => {
  const [country, state, city] = await Promise.all([
    prisma.country.findUnique({ where: { id: countryId } }),
    prisma.state.findUnique({ where: { id: stateId } }),
    prisma.city.findUnique({ where: { id: cityId } }),
  ]);

  if (!country) return !!handleError(res, null, messages.countryIDNotFound);
  if (!state) return !!handleError(res, null, messages.stateIDNotFound);
  if (!city) return !!handleError(res, null, messages.cityIDNotFound);

  return true;
};

// ===== Check Duplicate user by email or userName =====
const checkUserExistsByEmailOrUsername = async (email: string,userName: string,res: Response): Promise<boolean> => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { userName }],
    },
  });

  if (existingUser) {
    return !!handleError(res, null, messages.userAlreadyExists);
  }

  return true;
};

// Export all at once
export {
  //isUUID,validateUserInputFormat,
  validateRequiredField,
  validateLocationIdsExist,
  checkUserExistsByEmailOrUsername,
};

// //
// // ===== UUID Format Check =====
// //

// export const isUUID = (value: string, fieldName: string, res: Response): boolean => {
//   const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
//   const isValid = uuidPattern.test(value);

//   if (!isValid) {
//     const messageMap: Record<string, string> = {
//       countryId: messages.invalidCountryIdFormat,
//       stateId: messages.invalidStateIdFormat,
//       cityId: messages.invalidCityIdFormat,
//     };
//     const msg = messageMap[fieldName] || `Invalid UUID format for ${fieldName}`;
//     handleError(res, null, msg);
//     return false;
//   }

//   return true;
// };


// export const isValidMobile = (value: string, fieldName: string, res: Response): boolean => {
//   const pattern = /^\d{10}$/;
//   const isValid = pattern.test(value);

//   if (!isValid) {
//     const messageMap: Record<string, string> = {
//       mobile: messages.mobileInvalid,
//     };
//     const msg = messageMap[fieldName] || `Invalid format for ${fieldName}`;
//     handleError(res, null, msg);
//     return false;
//   }

//   return true;
// };
// export const validateUserInputFormat = (userData: any, res: Response): boolean => {
//   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailPattern.test(userData.email)) {
//     handleError(res, null, messages.emailInvalid);
//     return false;
//   }

//   if (userData.countryId && !isUUID(userData.countryId, "countryId", res)) {
//     return false;
//   }

//   if (userData.stateId && !isUUID(userData.stateId, "stateId", res)) {
//     return false;
//   }

//   if (userData.cityId && !isUUID(userData.cityId, "cityId", res)) {
//     return false;
//   }

//   const countryCodePattern = /^\+\d{1,4}$/;
//   if (!countryCodePattern.test(userData.countryCode)) {
//     handleError(res, null, messages.invalidCountryCodeFormat);
//     return false;
//   }

//   return true;
// };


// export const isValidMobile = (mobile: string, res: Response): void => {
//   const mobilePattern = /^[0-9]{10}$/;
//   const isValid = mobilePattern.test(mobile);

//   if (!isValid) {
//     handleError(res, null, messages.mobileInvalid);
//     throw new Error("Validation failed: Invalid mobile number");
//   }
// };








































































