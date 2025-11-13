import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "./constants";

export const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRES_IN as string,
    } as SignOptions
  );
};
