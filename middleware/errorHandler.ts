import { Response, Request, NextFunction } from "express";
import { ENVIRONMENT } from "../utils/constants";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (ENVIRONMENT === "development") {
    console.log(err);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  console.log(err);

  // JWT Expired
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token has expired. Please Login again",
    });
  }

  // Invalid Token
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid Token. Please Login again",
    });
  }

  // Not Authenticated
  if (err.statusCode === 401 || err.message === "Unauthorized") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please Login to continue",
    });
  }

  // Default 500 Error
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
}
