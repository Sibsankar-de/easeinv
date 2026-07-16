import { Store, User } from "@prisma/client";
import {
  getEmailVerificationEmail,
  getStoreCreatedEmail,
  getWelcomeEmail,
} from "./email.service";
import { publishEmailJob } from "./emailPublisher.service";
import { sendMail } from "../lib/mailer";

export const sendWelcomeEmail = async (user: User) => {
  const emailJob = await getWelcomeEmail(user);
  publishEmailJob(emailJob);
};

export const sendEmailVerificationEmail = async (
  user: User,
  verificationLink: string,
) => {
  const emailJob = await getEmailVerificationEmail(user, verificationLink);
  await sendMail(emailJob);
};

export const sendStoreCreatedEmail = async (
  user: User,
  store: Store,
  dashboardLink: string,
) => {
  const emailJob = await getStoreCreatedEmail(user, store, dashboardLink);
  publishEmailJob(emailJob);
};
