import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_USER,
} from "./constants";
import path from "path";
import { create } from "express-handlebars";
import prisma from "../prisma/prisma";
import { OtpPurposeTypeEnum, OtpTypeEnum } from "../generated/prisma/client";
import crypto from "crypto";

const hbs = create({
  extname: ".hbs",
  partialsDir: path.join(__dirname, "..", "hbs"),
  defaultLayout: false,
});

export const generateOtp = () => {
  const otp = 100000 + Math.floor(Math.random() * 900000);
  return otp;
};

type MailDetailsProps = {
  email: string;
  hbs: string;
  templateData: any;
  subject?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: {
    filename: string;
    path: string;
    cid: string;
  }[];
};

export const sendMail = async (mailDetails: MailDetailsProps) => {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  } as SMTPTransport.Options);

  const templatePath = path.join(__dirname, "..", "hbs", mailDetails.hbs);

  const templateData = {
    ...mailDetails.templateData,
  };

  const html = await new Promise((resolve, reject) => {
    hbs.renderView(templatePath, templateData, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });

  const info = await transporter.sendMail({
    from: SMTP_USER,
    to: mailDetails?.email,
    subject: mailDetails?.subject,
    cc: mailDetails?.cc,
    bcc: mailDetails?.bcc,
    html: html,
    attachments: mailDetails.attachments || [],
  } as nodemailer.SendMailOptions);

  if (info.accepted.length > 0) {
    return true;
  } else {
    return false;
  }
};

type SendOtpProps = {
  email?: string | null;
  phone?: string | null;
  userId: string;
  username?: string | null;
  expiresAt: Date;
  type: OtpTypeEnum;
  purpose: OtpPurposeTypeEnum;
  otp: number;
};

export const sendEmailOtp = async (otpSettings: SendOtpProps) => {
  try {
    const otpStatus = await prisma.oTP.create({
      data: {
        otp: otpSettings.otp?.toString(),
        userId: otpSettings.userId,
        email: otpSettings.email,
        phone: otpSettings.phone,
        expiresAt: otpSettings.expiresAt,
        type: otpSettings.type,
        purpose: otpSettings.purpose,
      },
    });

    const result = await sendMail({
      email: otpSettings.email!,
      hbs: "SendEmailOtp.hbs",
      templateData: {
        otp: otpSettings.otp,
      },
      attachments: [
        {
          filename: "alokah.png",
          path: path.join(__dirname, "..", "assets", "alokah.png"),
          cid: "logo_cid",
        },
      ],
    });

    return result && otpStatus ? true : false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const hashItem = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return `${salt}:${hash}`;
};

export const compareItem = (password: string, hash: string) => {
  const [salt, originalHash] = hash.split(":");

  const hashToCompare = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return originalHash === hashToCompare;
};
