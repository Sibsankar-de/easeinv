import { env } from "../configs/env";

const FRONTEND_URL = env.CLIENT_URL;

export const clientPages = {
  BASE_URL: FRONTEND_URL,
  PROFILE_PAGE: `${FRONTEND_URL}/profile`,
  constructPageUrl: (path: string) => `${FRONTEND_URL}${path}`,
  getStoreInvitePage: (invitationToken: string) =>
    `${FRONTEND_URL}/store-invite?token=${invitationToken}`,
};

export const clientAssets = {
  LOGO_FULL: `${FRONTEND_URL}/easeinv-logo-full.png`,
} as const;

