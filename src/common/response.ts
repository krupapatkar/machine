// src/common/response.ts
import { Response } from "express";

// Success Response 
export const handleSuccess = (
  res: Response,
  data: any,
  message: string,
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
) => {
  return res.status(200).json({
    status: true,
    message,
    data,
    ...(pagination && { pagination }),
  });
};

// Error Response Handler
export const handleError = (
  res: Response,
  data: any,
  message: string
) => {
  return res.status(200).json({
    status: false,
    message,
    data: null,
    //data: data ?? null,
  });
};

// export const handleError = (
//   res: Response,
//   error: any,
//   message: string
// ) => {
//   return res.status(500).json({
//     status: false,
//     message,
//     error: typeof error === "string" ? error : error?.message || error,
//   });
// };
