import catchAsync from "../middleware/catchAsyncError";
import { Request, Response, NextFunction } from "express";
import { generateToken, generateRefreshToken } from "../utils/jwt";
import { JWT_REFRESH_TOKEN } from "../utils/constants";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma";
import { generateOtp, sendMail } from "../utils/resusables";
import path from "path";
import { OtpPurposeTypeEnum, OtpTypeEnum } from "../generated/prisma/client";

export const refreshAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_TOKEN
      ) as unknown as jwt.JwtPayload & {
        userId: string;
      };
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateToken(decoded.userId);
    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      token: newAccessToken,
    });
  }
);

export const verifyUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone, otp, type, purpose } = req.body;

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

    if (!purpose || !type) {
      return res.status(400).json({
        success: false,
        message: "purpose or type is missing",
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

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    if (email && type === OtpTypeEnum.Email) {
      if (purpose === OtpPurposeTypeEnum.Verification) {
        const result = await prisma.user.update({
          where: {
            id: user?.id,
          },
          data: {
            isEmailVerified: true,
            isActive: true,
          },
        });

        if (!result.isEmailVerified) {
          return res.status(500).json({
            success: false,
            message: "Something went wrong",
          });
        }
      }

      //   if (purpose === OtpPurposeTypeEnum.Login) {
      //     const result = await prisma.user.update
      //   }
    }

    if (
      phone &&
      type === OtpTypeEnum.Phone &&
      purpose === OtpPurposeTypeEnum.Verification
    ) {
      // TODO: Need to implement the SMS based verification once DLT is approved
    }

    await prisma.oTP.deleteMany({
      where: {
        userId: user?.id,
      },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: `User ${purpose} succeeded`,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  }
);

export const sendOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone, purpose } = req.body;
    if ((!email && !phone) || !purpose) {
      return res.status(400).json({
        success: false,
        message: "either email or phone or purpose is missing",
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
        purpose: purpose,
        type: email ? OtpTypeEnum.Email : OtpTypeEnum.Phone,
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

export const logOut = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("refreshToken");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

// export const signInUser = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { email, password, passwordless, phone, username, otp } = req.body;

//     if (!email && !phone && !username) {
//       return res.status(400).json({
//         success: false,
//         message: "either email or phone or username is missing",
//       });
//     }

//     if (!password && !passwordless) {
//       return res.status(400).json({
//         success: false,
//         message: "Password is required to login",
//       });
//     }

//     if (passwordless && !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP is required to login",
//       });
//     }

//     const user = await prisma.user.findFirst({
//       where: {
//         OR: [
//           {
//             email: email,
//           },
//           {
//             phone: phone,
//           },
//           {
//             username: username,
//           },
//         ],
//       },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (password && !user.isPasswordBasedLogin) {
//       return res.status(400).json({
//         success: false,
//         message: "User has not set password",
//       });
//     }

//     if (
//       email !== user.email ||
//       phone !== user.phone ||
//       username !== user.username
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     if (passwordless) {
//       const otpResult = sendOtp({
//         email: user.email,
//         phone: user.phone,
//         userId: user.id,
//       });
//     }
//   }
// );
