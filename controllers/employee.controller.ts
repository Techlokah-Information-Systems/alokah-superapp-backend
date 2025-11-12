import prisma from "../prisma/prisma";
import { Response, Request, NextFunction } from "express";
import catchAsync from "../middleware/catchAsyncError";

export const addEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement the logic to Add Employees linked to userId and HotelId
  }
);

export const updateEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement the logic to Add Employees linked to userId and HotelId
  }
);

export const changeEmployeePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement the logic to Add Employees linked to userId and HotelId
  }
);

export const deactivateEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement the logic to Add Employees linked to userId and HotelId
  }
);

export const deleteEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implement the logic to Add Employees linked to userId and HotelId
  }
);
