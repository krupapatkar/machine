//src/types/User.ts
export interface User  {
  id?: string;
  name: string;
  userName: string;
  email: string;
  password: string;
  mobile: string;
  countryCode: string;
  countryId?: string;
  stateId?: string;
  cityId?: string;
  type?: string;
  verify?: boolean;
  fcmToken?: string;
  status?: boolean;
  createdBy?: string;
  updatedBy?: string;

  otp?: string;
  otpCount?: number;
  otpCreatedAt?: Date;
  otpExpiresAt?: Date;
  otpVerifiedAt?: Date;
}

// Common User Response Body
export interface UserProfile {
  id: string;
  name: string;
  userName: string;
  email: string;
  mobile: string;
  countryCode: string;
  countryName: string;
  stateName: string;
  cityName: string;
  otp?: string;
  //created_at: string;
  //updated_at: string;
}

// Signup User Response Body
export interface SignupResponse {
  userProfile: UserProfile;

}
// GET User Response Body
export interface GetUserResponse {
  userProfile: UserProfile;
}

// Edit User Response Body
export interface EditUserResponse {
  userProfile: UserProfile;
}

// Login Response Body
export interface LoginResponse {
  userProfile: UserProfile;
  token: string;
}
