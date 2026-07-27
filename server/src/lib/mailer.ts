import nodemailer from "nodemailer";
import { env } from "../configs/env";
import { EmailJob } from "../types/email";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,

  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },

  pool: true,
  maxConnections: 5,
  maxMessages: 100,

  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendMail(options: EmailJob) {
  try {
    const info = await transporter.sendMail({
      from: env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
    });

    log.info(
      `Email sent successfully to ${options.to}. Message ID: ${info.messageId}`,
    );

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    log.error(`Failed to send email to ${options.to}: ${error}`);
    throw error;
  }
}
