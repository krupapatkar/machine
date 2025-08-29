// src/utils/day.ts
import dayjs from "dayjs";


export const isSameDay = (d1: Date, d2: Date): boolean => {
  return dayjs(d1).isSame(dayjs(d2), "day");
};

export const diffInHours = (d1: Date, d2: Date): number => {
  return dayjs(d1).diff(dayjs(d2), "hour");
};

export const diffInMinutes = (d1: Date, d2: Date): number => {
  return dayjs(d1).diff(dayjs(d2), "minute");
};

export const now = (): Date => {
  return new Date();
};

export const getOtpExpiry = (minutes = 5): Date => {
  return dayjs().add(minutes, "minute").toDate();
};


export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};
