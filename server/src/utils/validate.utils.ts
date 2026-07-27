import { ZodType } from "zod";
import { ApiError } from "./apiErrorHandler";
import { StatusCodes } from "http-status-codes";

export const validateBody = <T>(schema: ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    const errorMessage = firstError.message;
    throw new ApiError(StatusCodes.BAD_REQUEST, errorMessage);
  }
  return result.data;
};
