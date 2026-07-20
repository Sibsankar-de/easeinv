import { User, Store, Product } from "../types/model";
import { emailTemplates } from "../constants/emailTemplates";
import { renderEmail } from "./emailRender.service";
import { EmailJob } from "../types/email";
import { clientPages } from "../constants/client.constant";

export const getStoreUserInviteEmail = async (
  user: User,
  store: Store,
  role: string,
  joinLink: string,
): Promise<EmailJob> => {
  const data = {
    storeName: store.name,
    recipientName: user.userName,
    recipientRole: role,
    recipientEmail: user.email,
    joinLink,
  };

  const body = await renderEmail({
    templateName: emailTemplates.STORE_USER_INVITE_EMAIL_TEMPLATE,
    data,
  });

  const emailJob: EmailJob = {
    to: user.email,
    subject: `You're invited to join ${data.storeName} on EaseInv`,
    html: body,
  };

  return emailJob;
};

export const getEmailVerificationEmail = async (
  user: User,
  verificationLink: string,
): Promise<EmailJob> => {
  const data = {
    recipientName: user.userName,
    verificationLink,
  };

  const body = await renderEmail({
    templateName: emailTemplates.EMAIL_VERIFICATION_TEMPLATE,
    data,
  });

  const emailJob: EmailJob = {
    to: user.email,
    subject: "Verify your email address - EaseInv",
    html: body,
  };

  return emailJob;
};

export const getWelcomeEmail = async (user: User): Promise<EmailJob> => {
  const data = {
    recipientName: user.userName,
    dashboardLink: clientPages.PROFILE_PAGE,
  };

  const body = await renderEmail({
    templateName: emailTemplates.WELCOME_EMAIL_TEMPLATE,
    data,
  });

  const emailJob: EmailJob = {
    to: user.email,
    subject: "Welcome to EaseInv!",
    html: body,
  };

  return emailJob;
};

export const getStoreCreatedEmail = async (
  user: User,
  store: Store,
): Promise<EmailJob> => {
  const dashboardLink = clientPages.constructStorePageUrl(store.id);
  const data = {
    recipientName: user.userName,
    storeName: store.name,
    type: store.type,
    currencyCode: store.currencyCode,
    storeLink: dashboardLink,
  };

  const body = await renderEmail({
    templateName: emailTemplates.STORE_CREATED_EMAIL_TEMPLATE,
    data,
  });

  const emailJob: EmailJob = {
    to: user.email,
    subject: `Your store ${data.storeName} has been created!`,
    html: body,
  };

  return emailJob;
};

export const getStockAlertEmail = async (
  user: User,
  store: Store,
  product: Product,
  inventoryLink: string,
): Promise<EmailJob> => {
  const currentStock = product.totalStock ?? 0;
  const isOutOfStock = currentStock <= 0;

  const data = {
    recipientName: user.userName,
    storeName: store.name,
    productName: product.name,
    productSku: product.sku,
    currentStock,
    stockUnit: product.stockUnit,
    inventoryLink,
    threshold: product.alertThreshold,
    isOutOfStock,
  };

  const body = await renderEmail({
    templateName: emailTemplates.STOCK_ALERT_EMAIL_TEMPLATE,
    data,
  });

  const subject = isOutOfStock
    ? `Out of Stock Alert: ${product.name}`
    : `Low Stock Alert: ${product.name} (${currentStock} ${product.stockUnit} left)`;

  const emailJob: EmailJob = {
    to: user.email,
    subject,
    html: body,
  };

  return emailJob;
};
