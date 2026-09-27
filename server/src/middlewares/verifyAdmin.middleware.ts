import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiErrorHandler";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "@prisma/client";

export const verifyAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    return next(
      new ApiError(StatusCodes.FORBIDDEN, "Admin access required"),
    );
  }
  next();
};
