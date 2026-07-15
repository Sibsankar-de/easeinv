import { User, Store } from "../types/model";
import { emailTemplates } from "../constants/emailTemplates";
import { renderEmail } from "./emailRender.service";
import { EmailJob } from "../types/email";

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

export const getWelcomeEmail = async (
  user: User,
  dashboardLink: string,
): Promise<EmailJob> => {
  const data = {
    recipientName: user.userName,
    dashboardLink,
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
