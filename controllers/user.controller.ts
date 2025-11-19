import catchAsync from "../middleware/catchAsyncError";
import prisma from "../prisma/prisma";
import { Request, Response, NextFunction } from "express";

export const addUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { username, password, email, phone } = req.body;

    if (typeof phone !== "string") phone = null;
    if (typeof email !== "string") email = null;
    if (typeof username !== "string") username = null;

    if (!password && (!username || !email) && (!username || !phone)) {
      return res.status(400).json({
        success: false,
        message: "either username or email or phone is missing",
      });
    }

    const data = {
      username: username,
      password: password || null,
      email: email || null,
      phone: phone || null,

      isPasswordBasedLogin: password ? true : false,
      isEmailBasedLogin: email ? true : false,
      isPhoneBasedLogin: phone ? true : false,
    };

    console.log(data);
    console.log("Final data before Prisma:", data);
    console.log("Type of data.phone:", typeof data.phone, data.phone);

    if (!password) {
      await prisma.user.create({
        data: data,
      });

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        passwordless: true,
      });
    }

    await prisma.user.create({
      data: data,
    });

    return res.status(201).json({
      succcess: true,
      message: "User created successfully",
      passwordless: false,
    });
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

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    console.log(user);

    return res.status(200).json({
      success: true,
      message: "User found",
      data: user,
    });
  }
);
