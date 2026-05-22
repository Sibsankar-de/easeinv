import { Middleware, MiddlewareContext } from "@/types/middleware";
import { NextRequest } from "next/server";
import { ApiError } from "./error-handler";

export async function runMiddlewares(
  req: NextRequest,
  middlewares: Middleware[],
  params?: Record<any, string>,
): Promise<MiddlewareContext> {
  let context: MiddlewareContext = {};

  try {
    for (const middleware of middlewares) {
      context = await middleware(req, context, params);
    }
    return context;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Internal server error");
  }
}
