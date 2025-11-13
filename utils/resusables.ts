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

const hbs = create({
  extname: ".hbs",
  partialsDir: path.join(__dirname, "..", "hbs"),
  defaultLayout: false,
});

export const generateOtp = () => {
  const otp = 100000 + Math.floor(Math.random() * 900000);
  return otp;
};

export const sendMail = async (mailDetails: any) => {
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
    from: SMTP_FROM,
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
