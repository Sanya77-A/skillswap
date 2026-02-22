import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

let transporter = null;

const initTransporter = () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return true;
  }
  return false;
};

const from = process.env.SMTP_FROM || "SkillSwap <noreply@skillswap.com>";

/**
 * Send email (no-op if SMTP not configured)
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter && !initTransporter()) {
    logger.warn("SMTP not configured, skipping email:", subject);
    return;
  }
  try {
    await transporter.sendMail({
      from,
      to,
      subject: subject || "SkillSwap",
      html: html || text,
      text,
    });
    logger.info("Email sent to", to);
  } catch (err) {
    logger.error("Email send failed:", err.message);
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  await sendEmail({
    to: email,
    subject: "SkillSwap - Password Reset",
    html: `Click to reset your password: <a href="${resetUrl}">${resetUrl}</a>. Link expires in 1 hour.`,
    text: `Reset link: ${resetUrl}`,
  });
};

export const sendRequestAcceptedEmail = async (email, senderName) => {
  await sendEmail({
    to: email,
    subject: "SkillSwap - Swap request accepted",
    html: `${senderName} accepted your swap request. Check your dashboard.`,
  });
};
