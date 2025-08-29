// src/common/messages.ts

export const messages = {
  // ──────────────────────────────
  // USER MESSAGES
  // ──────────────────────────────

  // Create
  userCreateSuccess: "Signup successful. OTP sent to email.",
  userCreateError: "Signup failed. Please try again.",

  // Validation
  userNotFound: "User not found",
  userAlreadyExists: "User with this email or username already exists.",
  userIDError: "User ID not found.",
  userIDNotFound: "User ID doesn't exist",
  userNameAlreadyExists: "This username is already in use.",
  emailAlreadyExists: "This email is already in use.",
  mobileRequired: "Mobile number is required",
  mobileInvalid: "Invalid mobile number",
  emailInvalid: "Invalid Email format",
  passwordInvalid: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
  passwordRequired: "Password is required",
  //countrycodeRequired: "Country code is required",
  usernameRequired: "User name is required",
  locationIDRequired:"Location IDs are required",
  emailRequired: "Email is required",
  nameRequired: "Name is required",
  otpRequired: "OTP is required",
  invalidOtpFormat:"OTP Formate is invlaid",
  incorrectPassword:"Password is incorrect.",
  userNotVerified: "User is not verified. Please verify your OTP.",
  newPasswordRequired:"New Password is required",
  confirmPasswordRequired:"Confirm Password is required",
  passwordTooShort:"Password must be at least 6 characters long",
  countryCodeRequired: "Country code is required",
  invalidCountryCodeFormat: "Country code is wrong.",
  invalidUniqueIdFormat: "Invalid unique ID format.",





  // Fetch
  userFetchSuccess: "User retrieved successfully",
  userFetchError: "Error fetching user",

  // Edit
  userEditSuccess: "User edited successfully",
  userEditError: "Error editing user",

  // Delete
  userDeleted: "User deleted successfully",
  userDeleteSuccess: "User deleted successfully",
  userDeleteError: "Error deleting user",

  // ──────────────────────────────
  // LOGIN MESSAGES
  // ──────────────────────────────
  loginSuccess: "Login successfully",
  loginError: "Invalid email or password",
  emailNotFound: "Email not found",
  emailOrUsernameRequired: "Email or username is required",
  emailOrUsernameNotFound: "Email or username not found",



  // Validation
  emailAndPasswordRequired: "Email and password are required",
  invalidEmailPasswordOrNotVerified: "Invalid email or password or OTP not verified",
  invalidEmailOrPassword: "Invalid email or password",

  // ──────────────────────────────
  // COUNTRY MESSAGES
  // ──────────────────────────────

  // Create
  countryCreateSuccess: "Country created successfully",
  countryCreateError: "Error creating country",

  // Validation
  countryAlreadyExists: "Country already exists",
  countryName: "Country name is required",
  countryNameRequired: "Country name is required",
  countryNameInvalid: "Country name must contain only letters and spaces",
  countryNameExists: "Country name already exists",
  countryNotFound: "Country not found",
  countryID: "Country ID is required",
  invalidCountryIdFormat: "Invalid Country ID format",
  countryIDExists: "Country ID already exists",
  countryIDNotFound: "Country ID not found",
  countryIdNotFound: "Country ID does not exist.",
  countryNameString: "Country name must be a string",


  // Fetch
  countryFetchSuccess: "Country retrieved successfully",
  countryFetchError: "Error fetching country",
  countryListFetchedSuccess: "Country List retrieved successfully",
  countryListFetchError: "Error fetching country list",

  // Edit
  countryEditSuccess: "Country edited successfully",
  countryEditError: "Error editing country",

  // Delete
  countryDeleteSuccess: "Country deleted successfully",
  countryDeleteError: "Error deleting country",
  countryNOTFound: "Country ID not found",

  // ──────────────────────────────
  // STATE MESSAGES
  // ──────────────────────────────

  // Create
  stateCreateSuccess: "State created successfully.",
  stateCreateError: "Error occurred while creating the state.",

  // Validation
  stateNameRequired: "State name is required.",
  stateNameInvalid: "State name must contain only alphabetic characters and spaces.",
  countryIdRequired: "Country ID is required to associate the state.",
  stateAlreadyExists: "State name already exists.",
  stateIDExists: "State ID not exists.",
  stateID: "State ID is required",
  invalidStateIdFormat: "Invalid State ID format",

  // Edit
  stateEditSuccess: "State updated successfully.",
  stateEditError: "Error occurred while updating the state.",

  // Fetch
  stateFetchSuccess: "State fetched successfully.",
  stateFetchError: "Error occurred while fetching state.",
  stateNotFound: "State not found.",
  stateIDNotFound: "State ID not found.",
  stateListFetchedSuccess: "State List retrieved successfully",
  stateListFetchError: "Error fetching State",
  stateIdNotFound: "State ID does not exist.",

  // Delete
  stateDeletedSucess: "State deleted successfully.",
  stateDeleteError: "Error occurred while deleting the state.",

  // ──────────────────────────────
  // CITY MESSAGES
  // ──────────────────────────────

  // Create
  cityCreateSuccess: "City created successfully.",
  cityCreateError: "Error occurred while creating the city.",

  // Validation
  cityNameRequired: "City name is required.",
  cityNameInvalid: "City name must contain only alphabetic characters and spaces.",
  stateIdRequired: "State ID is required to associate the city.",
  cityAlreadyExists: "City name already exists.",
  cityID: "City ID is required",
  invalidCityIdFormat: "Invalid City ID format",

  // Edit
  cityEditSuccess: "City updated successfully.",
  cityEditError: "Error occurred while updating the city.",

  // Fetch
  cityFetchSuccess: "Cities fetched successfully.",
  cityFetchError: "Error occurred while fetching city(ies).",
  cityNotFound: "City not found.",
  cityIDNotFound: "City ID not found.",
  cityListFetchedSuccess: "City List retrieved successfully",
  cityListFetchError: "Error fetching City",

  // Delete
  cityDeleteSuccess: "City deleted successfully.",
  cityDeleteError: "Error occurred while deleting the city.",

  // ──────────────────────────────
  // OTP MESSAGES
  // ──────────────────────────────

  otpVerified: "OTP verified successfully",
  otpVerificationFailed: "Failed to verify OTP",
  otpMissing: "Email and OTP are required",
  invalidOtp: "Invalid or expired OTP",
  otpSent: "OTP sent successfully",
  otpSendFailed: "Failed to send OTP",
  internalServerError: "Internal server error",
  signupSuccessOtpSent: "Signup successful. OTP sent to email.",
  passwordsDoNotMatch: "Passwords do not match",
  otpLimitReached: "You’ve reached the OTP limit. Please try again after 24 hours.",
  otpExpired: "OTP has expired. Please request a new one.",
  //emailAndOtpRequired: "Email and OTP are required.",
  otpVerificationError: "OTP verification error. Please try again.",
  otpSendError: "Failed to send OTP email",
  emailOtpError: "Email OTP Error",
  otpSentSuccess: "OTP sent successfully",

  // ──────────────────────────────
  // FORGOT PASSWORD
  // ──────────────────────────────

  forgetPasswordFailed: "Forget Password failed",
  forgetPasswordError: "Forget Password error",
  forgetPasswordAlreadyExists: "Forget password request already exists",
  forgetPasswordSuccess: "Forget Password successfully",

  // ──────────────────────────────
  // RESET PASSWORD
  // ──────────────────────────────

  allFieldsRequired: "All fields are required",
  passwordResetSuccess: "Password reset successfully",
  passwordResetError: "Reset Password Error",
  passwordResetFailed: "Reset Password failed",
  passwordMismatch: "Passwords do not match",
  resetPasswordError: "Reset Password Error:",
  resetPasswordFail: "Reset Password failed",

  // ──────────────────────────────
  // COUNTRY CODE MESSAGES
  // ──────────────────────────────


  // ──────────────────────────────
  // MAKE MESSAGES
  // ──────────────────────────────

  // Create
  makeCreateSuccess: "Make created successfully",
  makeCreateError: "Failed to create Make",
  makeValidationError: "Image and Name are required fields",
  makeCreateLogError: "Error creating Make",

  // Edit
  makeUpdateSuccess: "Make updated successfully",
  makeUpdateError: "Failed to update Make",
  makeUpdateException: "Error updating Make",
  makeNotFound: "Make not found",

  // Delete
  makeDeleteSuccess: "Make deleted successfully",
  makeDeleteError: "Failed to delete Make",
  makeDeleteException: "Error deleting Make",

  // Get By ID
  makeFetchSuccess: "Make fetched successfully",
  makeFetchError: "Failed to fetch Make",
};
