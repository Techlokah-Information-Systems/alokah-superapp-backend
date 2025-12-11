import prisma from "../prisma/prisma";
import { Response, Request, NextFunction } from "express";
import catchAsync from "../middleware/catchAsyncError";
import { z } from "zod";
import { createEmployeeSchema, updateEmployeeSchema } from "../types/schema";
import { hashItem } from "../utils/resusables";

const generateEmployeeCode = async (hotel: string) => {
  const prefix = "EMP";
  const first4Chars = hotel.slice(0, 4).toUpperCase();

  while (true) {
    const random4Numbers = Math.ceil(Math.random() * 10000);
    const employeeCode = `${prefix}${first4Chars}${random4Numbers}`;

    const existing = await prisma.employee.findFirst({
      where: {
        employeeCode: employeeCode,
      },
    });

    if (!existing) return employeeCode;
  }
};

export const addEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const body: z.infer<typeof createEmployeeSchema> = req.body;
    const hotel = await prisma.hotel.findFirst({
      where: {
        id: body.hotelId,
        ownerId: userId,
      },
    });

    if (!hotel) {
      return res.status(403).json({
        success: false,
        message:
          "Hotel could not be found or You are not authorized to access this hotel",
      });
    }

    const employeeCode = await generateEmployeeCode(hotel.name);

    const password = hashItem(body.password);

    const employee = await prisma.employee.create({
      data: {
        ...body,
        employeeCode: employeeCode,
        hotelId: hotel.id,
        userId: userId as string,
        password: password,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Employee added successfully",
      data: employee,
    });
  }
);

export const listEmployees = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const hotelId = req.query.hotelId as string;
    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel Id is required",
      });
    }

    const employees = await prisma.employee.findMany({
      where: {
        hotelId: hotelId,
        userId: userId,
      },
    });

    return res.status(200).json({
      success: true,
      data: employees,
    });
  }
);

export const updateEmployee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req?.user?.id;
    const employeeId = req?.params?.id;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee Id is required",
      });
    }

    const body: z.infer<typeof updateEmployeeSchema> = req.body;
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        userId: userId,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
        userId: userId,
      },
      data: body,
    });

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
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
