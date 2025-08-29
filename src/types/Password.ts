export interface ForgetPassword {
  email: string;
  mobile: string;
  countryCode: string;
  //createdBy?: string;
}

export interface ResetPassword {
  email: string;
  newPassword: string;
  confirmPassword: string;
}
