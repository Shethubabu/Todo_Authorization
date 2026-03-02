import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets not configured");
}

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;


const ACCESS_EXPIRES_IN: `${number}${"s" | "m" | "h" | "d"}` = (process.env.JWT_EXPIRES_IN || "15m") as `${number}${"s" | "m" | "h" | "d"}`;
const REFRESH_EXPIRES_IN: `${number}${"s" | "m" | "h" | "d"}` = (process.env.REFRESH_TOKEN_EXPIRES_IN || "7d") as `${number}${"s" | "m" | "h" | "d"}`;

export const generateAccessToken = (payload: Record<string, any>) => {
  const options: SignOptions = { expiresIn: ACCESS_EXPIRES_IN }; 
  return jwt.sign(payload, ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: Record<string, any>) => {
  const options: SignOptions = { expiresIn: REFRESH_EXPIRES_IN }; 
  return jwt.sign(payload, REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET);
};