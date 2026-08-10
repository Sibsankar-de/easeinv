import { NotificationType } from "../enums/notification.enum";
import { publishNotificationJob } from "./notificationPublisher.service";
import { createModuleLogger } from "../utils/logger";
import type { User, Store, Product } from "@prisma/client";

const log = createModuleLogger(import.meta.url);

/**
 * Internal helper: wraps publishNotificationJob with an error boundary.
 * All public functions in this module are fire-and-forget — they never
 * throw and never block the caller.
 */
async function dispatch(
  job: Parameters<typeof publishNotificationJob>[0],
): Promise<void> {
  try {
    await publishNotificationJob(job);
  } catch (err) {
    log.error("[Transactional Notification] Dispatch failed: " + err);
  }
}

export const notifyInvoiceCreated = (
  user: User,
  invoice: { id: string; invoiceNumber: string },
  store: Store,
) =>
  dispatch({
    userId: user.id,
    type: NotificationType.INVOICE_CREATED,
    title: "Invoice Created",
    message: `Invoice ${invoice.invoiceNumber} has been created for store "${store.name}".`,
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      storeId: store.id,
    },
  });

export const notifyInvoicePaid = (
  user: User,
  invoice: { id: string; invoiceNumber: string },
  store: Store,
) =>
  dispatch({
    userId: user.id,
    type: NotificationType.INVOICE_PAID,
    title: "Invoice Fully Paid",
    message: `Invoice ${invoice.invoiceNumber} has been fully paid in store "${store.name}".`,
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      storeId: store.id,
    },
  });

export const notifyStockLow = (user: User, product: Product, store: Store) =>
  dispatch({
    userId: user.id,
    type: NotificationType.STOCK_LOW,
    title: "Low Stock Alert",
    message: `"${product.name}" is running low (${product.totalStock} ${product.stockUnit} left) in "${store.name}".`,
    metadata: {
      productId: product.id,
      productName: product.name,
      storeId: store.id,
      currentStock: product.totalStock,
      alertThreshold: product.alertThreshold,
    },
  });

export const notifyStockOut = (user: User, product: Product, store: Store) =>
  dispatch({
    userId: user.id,
    type: NotificationType.STOCK_OUT,
    title: "Out of Stock",
    message: `"${product.name}" is out of stock in "${store.name}".`,
    metadata: {
      productId: product.id,
      productName: product.name,
      storeId: store.id,
    },
  });

export const notifyStoreUserInvited = (
  invitedUser: User,
  store: Store,
  role: string,
) =>
  dispatch({
    userId: invitedUser.id,
    type: NotificationType.STORE_USER_INVITED,
    title: "Store Invitation",
    message: `You've been invited to join "${store.name}" as ${role}.`,
    metadata: { storeId: store.id, storeName: store.name, role },
  });

export const notifyStoreUserJoined = (
  ownerUserId: string,
  joinedUser: User,
  store: Store,
) =>
  dispatch({
    userId: ownerUserId,
    type: NotificationType.STORE_USER_JOINED,
    title: "New Team Member",
    message: `${joinedUser.userName} has joined your store "${store.name}".`,
    metadata: {
      storeId: store.id,
      storeName: store.name,
      userId: joinedUser.id,
      userName: joinedUser.userName,
    },
  });

export const notifyRoleChanged = (user: User, store: Store, newRole: string) =>
  dispatch({
    userId: user.id,
    type: NotificationType.STORE_USER_ROLE_CHANGED,
    title: "Role Updated",
    message: `Your role in "${store.name}" has been changed to ${newRole}.`,
    metadata: { storeId: store.id, storeName: store.name, newRole },
  });

export const notifyEmailVerified = (user: User) =>
  dispatch({
    userId: user.id,
    type: NotificationType.EMAIL_VERIFIED,
    title: "Email Verified",
    message:
      "Your email address has been successfully verified. Welcome aboard!",
    metadata: {},
  });

export const notifyPasswordChanged = (user: User) =>
  dispatch({
    userId: user.id,
    type: NotificationType.PASSWORD_CHANGED,
    title: "Password Changed",
    message:
      "Your account password has been changed. If this wasn't you, contact support immediately.",
    metadata: {},
  });
