import { env } from "../configs/env";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";

export const verifyTurnstileToken = async (
  token: string,
  remoteIp?: string,
): Promise<boolean> => {
  if (!token) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Turnstile verification token is required.",
    );
  }

  const secretKey = env.CLOUDFLARE_TURNSTILE_SECRET;
  if (!secretKey) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Cloudflare Turnstile secret key is not configured.",
    );
  }

  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);
  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const data = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Security check failed. Please complete the Turnstile challenge.",
      );
    }

    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to verify Turnstile token.",
    );
  }
};
