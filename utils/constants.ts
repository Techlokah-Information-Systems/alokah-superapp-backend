import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export const PORT = process.env.PORT || 4000;
export const HOST = process.env.HOST || "0.0.0.0";
export const ENVIRONMENT = process.env.ENVIRONMENT || "development";
export const API_BASE_PATH = `/api/${process.env.API_VERSION || "v1"}`;

export const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
export const SMTP_PORT = process.env.SMTP_PORT || 465;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASSWORD = process.env.SMTP_PASS;
export const SMTP_FROM = process.env.SMTP_FROM;

export const JWT_SECRET = process.env.JWT_SECRET_KEY!;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const JWT_COOKIE_EXPIRES_IN = process.env.JWT_COOKIE_EXPIRES_IN!;

export const JWT_SECRET_REFRESH_EXPIRES_IN =
  process.env.JWT_SECRET_REFRESH_EXPIRES_IN!;

export const JWT_REFRESH_TOKEN = process.env.JWT_SECRET_REFRESH_KEY!;
