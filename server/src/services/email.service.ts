import { User, Store, Product, Order } from "../types/model";
import { emailTemplates } from "../constants/emailTemplates";
import { renderEmail } from "./emailRender.service";
import { EmailJob } from "../types/email";
import { clientPages } from "../constants/client.constant";
import { env } from "../configs/env";

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

export interface BatchStockAlertProductItem {
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  stockUnit: string;
  threshold: number;
  inventoryLink: string;
}

export const getBatchStockAlertEmail = async (
  user: User,
  store: Store,
  products: BatchStockAlertProductItem[],
): Promise<EmailJob> => {
  const formattedProducts = products.map((p) => {
    const isOutOfStock = p.currentStock <= 0;
    return {
      ...p,
      isOutOfStock,
      statusText: isOutOfStock ? "Out of Stock" : "Low Stock",
      badgeClass: isOutOfStock ? "alert-badge" : "warning-badge",
    };
  });

  const hasOutOfStock = formattedProducts.some((p) => p.isOutOfStock);
  const allOutOfStock =
    formattedProducts.length > 0 &&
    formattedProducts.every((p) => p.isOutOfStock);
  const totalAffectedCount = formattedProducts.length;
  const itemLabel = totalAffectedCount === 1 ? "product" : "products";
  const inventoryDashboardLink = clientPages.constructStorePageUrl(
    store.id,
    "/inventory",
  );

  const data = {
    recipientName: user.userName,
    storeName: store.name,
    totalAffectedCount,
    itemLabel,
    hasOutOfStock,
    products: formattedProducts,
    inventoryDashboardLink,
  };

  const body = await renderEmail({
    templateName: emailTemplates.STOCK_BATCH_ALERT_EMAIL_TEMPLATE,
    data,
  });

  const subject = allOutOfStock
    ? `🚨 Out of Stock Alert: ${totalAffectedCount} ${itemLabel} in ${store.name}`
    : `⚠️ Stock Alert: ${totalAffectedCount} ${itemLabel} in ${store.name}`;

  const emailJob: EmailJob = {
    to: user.email,
    subject,
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

export const getPasswordResetEmail = async (
  user: User,
  resetLink: string,
): Promise<EmailJob> => {
  const data = {
    recipientName: user.userName,
    resetLink,
  };

  const body = await renderEmail({
    templateName: emailTemplates.PASSWORD_RESET_TEMPLATE,
    data,
  });

  const emailJob: EmailJob = {
    to: user.email,
    subject: "Reset your password - EaseInv",
    html: body,
  };

  return emailJob;
};

export const getCustomerQueryEmail = async (
  name: string,
  email: string,
  message: string,
): Promise<EmailJob> => {
  const data = {
    senderName: name,
    senderEmail: email,
    senderMessage: message,
    submittedAt: new Date().toLocaleString(),
  };

  const body = await renderEmail({
    templateName: emailTemplates.CUSTOMER_QUERY_EMAIL_TEMPLATE,
    data,
  });

  const emailJob: EmailJob = {
    to: env.SUPPORT_EMAIL,
    subject: `[EaseInv Inquiry] New Message from ${name}`,
    html: body,
  };

  return emailJob;
};

export interface OrderCustomerInfo {
  name: string;
  email?: string | null;
}

export const getOrderProcessingEmail = async (
  customer: OrderCustomerInfo,
  store: Store,
  order: Order,
): Promise<EmailJob> => {
  const data = {
    customerName: customer.name,
    orderNumber: order.orderNumber,
    storeName: store.name,
    orderDate: new Date(order.orderDate).toLocaleDateString(),
    currencyCode: store.currencyCode,
    totalAmount: order.totalAmount.toFixed(2),
    storeContact: store.contactEmail || store.contactNo || "",
  };

  const body = await renderEmail({
    templateName: emailTemplates.ORDER_PROCESSING_EMAIL_TEMPLATE,
    data,
  });

  const emailJob: EmailJob = {
    to: customer.email || "",
    subject: `[${store.name}] Order #${order.orderNumber} is Being Processed`,
    html: body,
  };

  return emailJob;
};

export const getOrderDispatchedEmail = async (
  customer: OrderCustomerInfo,
  store: Store,
  order: Order,
  deliveryReference: string,
  note?: string,
): Promise<EmailJob> => {
  const data = {
    customerName: customer.name,
    orderNumber: order.orderNumber,
    storeName: store.name,
    currencyCode: store.currencyCode,
    totalAmount: order.totalAmount.toFixed(2),
    deliveryReference,
    deliveryNote: note || "",
    storeContact: store.contactEmail || store.contactNo || "",
  };

  const body = await renderEmail({
    templateName: emailTemplates.ORDER_DISPATCHED_EMAIL_TEMPLATE,
    data,
  });

  const emailJob: EmailJob = {
    to: customer.email || "",
    subject: `[${store.name}] Order #${order.orderNumber} has been Dispatched`,
    html: body,
  };

  return emailJob;
};

export const getOrderCompletedEmail = async (
  customer: OrderCustomerInfo,
  store: Store,
  order: Order,
  invoiceNumber: string,
): Promise<EmailJob> => {
  const data = {
    customerName: customer.name,
    orderNumber: order.orderNumber,
    invoiceNumber,
    storeName: store.name,
    currencyCode: store.currencyCode,
    subtotal: order.subtotal.toFixed(2),
    discountAmount: order.discountAmount > 0 ? order.discountAmount.toFixed(2) : "",
    shippingAmount: order.shippingAmount > 0 ? order.shippingAmount.toFixed(2) : "",
    totalAmount: order.totalAmount.toFixed(2),
    storeContact: store.contactEmail || store.contactNo || "",
  };

  const body = await renderEmail({
    templateName: emailTemplates.ORDER_COMPLETED_EMAIL_TEMPLATE,
    data,
  });

  const emailJob: EmailJob = {
    to: customer.email || "",
    subject: `[${store.name}] Order #${order.orderNumber} Completed - Invoice #${invoiceNumber}`,
    html: body,
  };

  return emailJob;
};

export const getOrderRejectedEmail = async (
  customer: OrderCustomerInfo,
  store: Store,
  order: Order,
  reason?: string,
): Promise<EmailJob> => {
  const data = {
    customerName: customer.name,
    orderNumber: order.orderNumber,
    storeName: store.name,
    reason: reason || "",
    storeContact: store.contactEmail || store.contactNo || "",
  };

  const body = await renderEmail({
    templateName: emailTemplates.ORDER_REJECTED_EMAIL_TEMPLATE,
    data,
  });

  const emailJob: EmailJob = {
    to: customer.email || "",
    subject: `[${store.name}] Order #${order.orderNumber} Status Update`,
    html: body,
  };

  return emailJob;
};

