import catchAsync from "../middleware/catchAsyncError";
import prisma from "../prisma/prisma";
import { Request, Response, NextFunction } from "express";
import { generateOtp, sendMail } from "../utils/resusables";
import path from "path";
import { generateToken } from "../utils/jwt";

export const addUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { username, password, email, phone } = req.body;

    console.log("Body", req.body);
    console.log("Type of phone:", typeof phone, "Value:", phone);

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

export const signInUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const sendOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "either email or phone is missing",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            phone: phone,
          },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const latestOtp = await prisma.oTP.findFirst({
      where: {
        userId: user?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (latestOtp) {
      const diffMs = Date.now() - latestOtp.createdAt.getTime();
      if (diffMs < 30 * 1000) {
        return res.status(429).json({
          success: false,
          message: "Too many requests",
          retryAfterSeconds: Math.ceil((30 * 1000 - diffMs) / 1000),
        });
      }
    }

    const generatedOtp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    const otpStatus = await prisma.oTP.create({
      data: {
        otp: generatedOtp.toString(),
        userId: user.id,
        email: user.email,
        phone: user.phone,
        expiresAt: expiresAt,
      },
    });

    if (!otpStatus) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }

    if (email) {
      const result = await sendMail({
        email,
        hbs: "SendEmailOtp.hbs",
        templateData: {
          otp: generatedOtp,
        },
        attachments: [
          {
            filename: "alokah.png",
            path: path.join(__dirname, "..", "assets", "alokah.png"),
            cid: "logo_cid",
          },
        ],
      });

      if (!result) {
        res.status(500).json({
          success: false,
          message: "Something went wrong",
        });
      }

      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    }

    if (phone) {
    }
  }
);

export const verifyUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone, otp } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "either email or phone is missing",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "otp is missing",
      });
    }

    const otpDetails = await prisma.oTP.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            phone: phone,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpDetails) {
      return res.status(404).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (otpDetails.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (otpDetails.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is incorrect",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            phone: phone,
          },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email) {
      const result = await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          isEmailVerified: true,
        },
      });

      if (result.isEmailVerified) {
        await prisma.oTP.deleteMany({
          where: {
            userId: user?.id,
          },
        });

        const token = generateToken(user.id);

        return res.status(200).json({
          success: true,
          message: "User verified successfully",
          token: token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      }

      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }

    if (phone) {
    }
  }
);
