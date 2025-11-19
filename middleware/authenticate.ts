import catchAsync from "./catchAsyncError";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants";
import prisma from "../prisma/prisma";
import { NextFunction, Request, Response } from "express";

export const isAuthenticatedUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("Inside Here");

      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET as string
    ) as unknown as jwt.JwtPayload & {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId as string,
      },
    });

    if (!user) {
      return next(new Error("Unauthorized"));
    }

    req.user = user;

    next();
  }
);

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role as string)) {
      return next(
        new Error(
          `Role: ${req.user?.role} is not allowed to access this resource`
        )
      );
    }

    next();
  };
};
