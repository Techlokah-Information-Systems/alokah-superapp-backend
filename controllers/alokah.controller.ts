import catchAsync from "../middleware/catchAsyncError";
import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";
import {
  compareItem,
  generateOtp,
  hashItem,
  sendMail,
} from "../utils/resusables";
import {
  OtpPurposeTypeEnum,
  OtpTypeEnum,
  RolesEnum,
  SecretsTypeEnum,
} from "../generated/prisma/client";
import path from "node:path";
import {
  addSecretSchema,
  createAlokahInventoryItemSchema,
  createAlokahUserSchema,
  verifyOtpSchema,
} from "../types/schema";
import { generateToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants";

const generateAssociateId = async () => {
  while (true) {
    const associateId = Math.random().toString().substring(2, 6); // 4 Digits Only
    const user = await prisma.alokahUser.findFirst({
      where: {
        associateId: associateId,
      },
    });

    if (!user) {
      return associateId;
    }
  }
};

const sendOtpAndMail = async (email: string, userId?: string) => {
  const generatedOtp = generateOtp();
  const hashedOtp = hashItem(generatedOtp.toString());
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const otpStatus = await prisma.oTP.create({
    data: {
      otp: hashedOtp,
      alokahUserId: userId,
      email: email,
      expiresAt,
      type: OtpTypeEnum.Email,
      purpose: OtpPurposeTypeEnum.Verification,
    },
  });

  if (!otpStatus) {
    return false;
  }

  return await sendMail({
    email: email,
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
};

const checkRateLimit = async (email: string) => {
  const latestOtp = await prisma.oTP.findFirst({
    where: {
      email,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (latestOtp) {
    const diffMs = Date.now() - latestOtp.createdAt.getTime();
    if (diffMs < 5 * 1000) {
      return {
        isLimited: true,
        retryAfter: Math.ceil((5 * 1000 - diffMs) / 1000),
      };
    }
  }
  return { isLimited: false };
};

export const createAlokahUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, secret } = createAlokahUserSchema.parse(req.body);

    const secretDetails = await prisma.secrets.findFirst({
      where: {
        type: SecretsTypeEnum.AUTH,
      },
    });

    if (!secretDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid secret",
      });
    }

    let isValidSecret;
    if (secretDetails?.expiresAt) {
      isValidSecret = compareItem(secret, secretDetails.secret);
    }

    if (!isValidSecret) {
      return res.status(400).json({
        success: false,
        message: "Invalid secret",
      });
    }

    const token = generateToken(email);

    let user = await prisma.alokahUser.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      const { isLimited, retryAfter } = await checkRateLimit(email);
      if (isLimited) {
        return res.status(429).json({
          success: false,
          message: "Too many requests",
          retryAfterSeconds: retryAfter,
        });
      }

      const otpSent = await sendOtpAndMail(email, user.id);

      if (!otpSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to create or send OTP",
        });
      }

      const message = user.isEmailVerified
        ? "User already exists and verified"
        : "User already exists and not verified, please verify your email";

      return res.status(200).json({
        success: true,
        message,
        data: user.isEmailVerified ? { token } : undefined,
      });
    }

    user = await prisma.alokahUser.create({
      data: {
        email,
        associateId: await generateAssociateId(),
        role: RolesEnum.SuperAdmin,
      },
    });

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Failed to create user",
      });
    }

    const otpSent = await sendOtpAndMail(email, user.id);

    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to create or send OTP",
      });
    }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user,
        token,
      },
    });
  }
);

export const authenticateAlokahUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "email or mobile is missing",
      });
    }

    let user;
    user = await prisma.alokahUser.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user) {
      const associateId = await generateAssociateId();
      user = await prisma.alokahUser.create({
        data: {
          email: email as string,
          phone: phone as string,
          role: RolesEnum.SuperAdmin,
          associateId: associateId,
        },
      });
    }

    const latestOtp = await prisma.oTP.findFirst({
      where: email ? { email } : { phone },
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
    const hashedOtp = hashItem(generatedOtp.toString());
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otpStatus = await prisma.oTP.create({
      data: {
        otp: hashedOtp,
        userId: user?.id,
        email: email as string,
        phone: phone as string,
        expiresAt,
        type: email ? OtpTypeEnum.Email : OtpTypeEnum.Phone,
        purpose: OtpPurposeTypeEnum.Verification,
      },
    });

    if (!otpStatus) {
      return res.status(500).json({
        success: false,
        message: "Failed to create OTP",
      });
    }

    await sendMail({
      email: email as string,
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

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  }
);

const verifySuperAdminToken = async (
  token: string | undefined
): Promise<boolean> => {
  if (!token) return false;
  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET as string
    ) as jwt.JwtPayload & {
      userId: string;
    };
    if (!decoded) return false;

    const user = await prisma.alokahUser.findUnique({
      where: { email: decoded.userId },
    });
    return !!user;
  } catch {
    return false;
  }
};

export const verifyOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otp, email, phone, accountType } = verifyOtpSchema.parse(req.body);
    const token = req.headers.authorization?.split(" ")[1];

    if (accountType === "AlokahSuperAdmin") {
      const isAuthorized = await verifySuperAdminToken(token);
      if (!isAuthorized) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
    }

    const otpDetails = await prisma.oTP.findFirst({
      where: email ? { email } : { phone },
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
        message: "OTP expired",
      });
    }

    const isValidOtp = compareItem(otp, otpDetails.otp);
    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await prisma.oTP.deleteMany({
      where: {
        email,
        phone,
      },
    });

    // We can safely assume email or phone is present due to Zod validation
    // using the 'as string' assertion or the logic below for the where clause
    const user = await prisma.alokahUser.update({
      where: email ? { email } : { phone: phone as string },
      data: {
        isActive: true,
      },
    });

    const jwtToken = generateToken(user?.id);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token: jwtToken,
    });
  }
);

export const addItemToCentralInventory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Authorization Check
    const user = req.user;
    // Assuming req.user is populated and has a role field. If AlokahUser is a separate entity/table,
    // ensure the middleware populating req.user supports it.
    if (!user || user.role !== RolesEnum.SuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only SuperAdmins can perform this action",
      });
    }

    // 2. Input Validation
    const body = createAlokahInventoryItemSchema.parse(req.body);

    // 3. Data Integrity Check
    const inventory = await prisma.alokahInventory.findUnique({
      where: {
        id: body.inventoryId,
      },
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Central Inventory not found",
      });
    }

    const item = await prisma.alokahInventoryItem.create({
      data: body,
    });

    if (!item) {
      return res.status(500).json({
        success: false,
        message: "Failed to add item to central inventory",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item added to central inventory successfully",
      data: item,
    });
  }
);

export const searchCentralInventoryItems = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Search query is missing",
      });
    }

    const items = await prisma.alokahInventoryItem.findMany({
      where: {
        itemName: {
          contains: search as string,
          mode: "insensitive",
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Items found successfully",
      data: items,
    });
  }
);

export const addSecret = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { secret, type } = addSecretSchema.parse(req.body);

    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 Days
    const hashedSecret = hashItem(secret);

    const secretDetails = await prisma.secrets.create({
      data: {
        secret: hashedSecret,
        type,
        expiresAt,
      },
    });

    if (!secretDetails) {
      return res.status(500).json({
        success: false,
        message: "Failed to add secret",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Secret added successfully",
      data: {
        id: secretDetails.id,
        type: secretDetails.type,
        expiresAt: secretDetails.expiresAt,
      },
    });
  }
);
