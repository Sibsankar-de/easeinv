import mongoose from "mongoose";
import { NextRequest } from "next/server";

export type MiddlewareContext = {
  files?: Record<string, File>;
  userId?: mongoose.Types.ObjectId;
  [key: string]: any;
};

export type Middleware = (
  req: NextRequest,
  context: MiddlewareContext,
  params?: Record<any, string>,
) => Promise<MiddlewareContext>;
