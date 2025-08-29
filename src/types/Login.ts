//src\types\Login.ts
export interface Login {
  email: string;
  password: string;
  fcmToken?: string;
}

export interface VerifyOtp {
  email: string;
  otp: string;
}


export interface LoginRequestBody {
  email?: string;
  userName?: string;
  password: string;
}

// User Info Response
// export interface UserProfile {
//   id: string;
//   name?: string;
//   userName: string;
//   email: string;
//   mobile: string;
//   countryCode: string;
//   countryName?: string;
//   stateName?: string;
//   cityName?: string;
//   created_at: string;
//   updated_at: string;
// }




// export interface LoginResponse {
//   email: string;
//   password: string;  // hashed
//   token: string;
// }



