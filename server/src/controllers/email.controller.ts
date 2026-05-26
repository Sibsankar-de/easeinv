import { StoreModelType } from "../models/store.model";
import { UserModelType } from "../models/user.model";
import { renderEmail } from "../services/emailRender.service";
import { EmailJob } from "../types/email";

export const getStoreUserInviteEmail = async (
  user: UserModelType,
  store: StoreModelType,
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
