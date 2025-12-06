import jwt, { SignOptions } from "jsonwebtoken";
import {
  JWT_EXPIRES_IN,
  JWT_REFRESH_TOKEN,
  JWT_SECRET,
  JWT_SECRET_REFRESH_EXPIRES_IN,
} from "./constants";
import crypto from "crypto";

export const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRES_IN as string,
    } as SignOptions
  );
};

export const generateRefreshToken = (userId: string) => {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign(
    { sub: userId, tid: tokenId },
    JWT_REFRESH_TOKEN as string,
    {
      expiresIn: JWT_SECRET_REFRESH_EXPIRES_IN as string,
    } as SignOptions
  );

  return { token, tokenId };
};
