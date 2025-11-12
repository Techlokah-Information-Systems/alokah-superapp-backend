import catchAsync from "../middleware/catchAsyncError";
import prisma from "../prisma/prisma";
import { Request, Response, NextFunction } from "express";

export const addUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Implement Logic for user addition
  }
);

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Implement Logic for updating user in DB
  }
);

export const deactivateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Implement Logic for updating user in DB
  }
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Implement Logic for updating user in DB
  }
);
