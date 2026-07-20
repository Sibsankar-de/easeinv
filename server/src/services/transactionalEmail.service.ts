import { Product, Store, User } from "@prisma/client";
import {
  getEmailVerificationEmail,
  getStockAlertEmail,
  getStoreCreatedEmail,
  getWelcomeEmail,
} from "./email.service";
import { publishEmailJob } from "./emailPublisher.service";
import { sendMail } from "../lib/mailer";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

export const sendWelcomeEmail = async (user: User) => {
  try {
    const emailJob = await getWelcomeEmail(user);
    await publishEmailJob(emailJob);
  } catch (error) {
    log.error("Email publishing failed " + error);
  }
};

export const sendEmailVerificationEmail = async (
  user: User,
  verificationLink: string,
) => {
  let emailJob;
  try {
    emailJob = await getEmailVerificationEmail(user, verificationLink);
  } catch (error) {
    log.error("Failed to create email " + error);
    return;
  }
  await sendMail(emailJob);
};

export const sendStoreCreatedEmail = async (user: User, store: Store) => {
  try {
    const emailJob = await getStoreCreatedEmail(user, store);
    await publishEmailJob(emailJob);
  } catch (error) {
    log.error("Email publishing failed " + error);
  }
};

export const sendStockAlertEmail = async (
  user: User,
  store: Store,
  product: Product,
  inventoryLink: string,
) => {
  try {
    const emailJob = await getStockAlertEmail(
      user,
      store,
      product,
      inventoryLink,
    );
    await publishEmailJob(emailJob);
  } catch (error) {
    log.error("Email publishing failed " + error);
  }
};
