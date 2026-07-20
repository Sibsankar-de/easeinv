import { Schema } from "zod";
import { ApiError } from "./apiErrorHandler";
import { StatusCodes } from "http-status-codes";

export const validateBody = <T>(schema: Schema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    // Extract first error message and throw a BAD_REQUEST ApiError
    const firstError = result.error.issues[0];
    const errorMessage = firstError.message;
    throw new ApiError(StatusCodes.BAD_REQUEST, errorMessage);
  }
  return result.data;
};
