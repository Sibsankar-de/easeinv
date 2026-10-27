import { Order, Product, Store, User } from "@prisma/client";
import {
  getEmailVerificationEmail,
  getStockAlertEmail,
  getBatchStockAlertEmail,
  BatchStockAlertProductItem,
  getStoreCreatedEmail,
  getWelcomeEmail,
  getPasswordResetEmail,
  getCustomerQueryEmail,
  getOrderProcessingEmail,
  getOrderDispatchedEmail,
  getOrderCompletedEmail,
  getOrderRejectedEmail,
  OrderCustomerInfo,
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

export const sendBatchStockAlertEmail = async (
  user: User,
  store: Store,
  products: BatchStockAlertProductItem[],
) => {
  try {
    const emailJob = await getBatchStockAlertEmail(user, store, products);
    await publishEmailJob(emailJob);
  } catch (error) {
    log.error("Email publishing failed " + error);
  }
};

export const sendPasswordResetEmail = async (user: User, resetLink: string) => {
  let emailJob;
  try {
    emailJob = await getPasswordResetEmail(user, resetLink);
  } catch (error) {
    log.error("Failed to create email " + error);
    return;
  }
  await sendMail(emailJob);
};

export const sendCustomerQueryEmail = async (
  name: string,
  email: string,
  message: string,
) => {
  try {
    const emailJob = await getCustomerQueryEmail(name, email, message);
    await publishEmailJob(emailJob);
  } catch (error) {
    log.error("Email publishing failed " + error);
  }
};

export const sendOrderProcessingEmail = async (
  customer: OrderCustomerInfo,
  store: Store,
  order: Order,
) => {
  if (!customer.email) return;
  try {
    const emailJob = await getOrderProcessingEmail(customer, store, order);
    await publishEmailJob(emailJob);
  } catch (error) {
    log.error("Failed to send order processing email " + error);
  }
};

export const sendOrderDispatchedEmail = async (
  customer: OrderCustomerInfo,
  store: Store,
  order: Order,
  deliveryReference: string,
  note?: string,
) => {
  if (!customer.email) return;
  try {
    const emailJob = await getOrderDispatchedEmail(
      customer,
      store,
      order,
      deliveryReference,
      note,
    );
    await publishEmailJob(emailJob);
  } catch (error) {
    log.error("Failed to send order dispatched email " + error);
  }
};

export const sendOrderCompletedEmail = async (
  customer: OrderCustomerInfo,
  store: Store,
  order: Order,
  invoiceNumber: string,
) => {
  if (!customer.email) return;
  try {
    const emailJob = await getOrderCompletedEmail(
      customer,
      store,
      order,
      invoiceNumber,
    );
    await publishEmailJob(emailJob);
  } catch (error) {
    log.error("Failed to send order completed email " + error);
  }
};

export const sendOrderRejectedEmail = async (
  customer: OrderCustomerInfo,
  store: Store,
  order: Order,
  reason?: string,
) => {
  if (!customer.email) return;
  try {
    const emailJob = await getOrderRejectedEmail(customer, store, order, reason);
    await publishEmailJob(emailJob);
  } catch (error) {
    log.error("Failed to send order rejected email " + error);
  }
};

