import { Request, Response, NextFunction } from "express";
import cors, { CorsOptionsDelegate } from "cors";

export const externalCorsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const corsOptionsDelegate: CorsOptionsDelegate<Request> = (
    request,
    callback,
  ) => {
    try {
      const origin = request.header("Origin");
      const apiKey = request.apiKey;

      // If no Origin header (server-side request)
      if (!origin) {
        return callback(null, {
          origin: true,
          credentials: true,
        });
      }

      // If Origin is present (browser/client-side request)
      // Block if allowClientRequest is false
      if (!apiKey?.allowClientRequest) {
        return callback(null, {
          origin: false,
        });
      }

      // Check if origin is within whitelisted origins
      const whitelistedOrigins = apiKey.whitelistedOrigins || [];
      const isAllowed = whitelistedOrigins.includes(origin);

      callback(null, {
        origin: isAllowed,
        credentials: true,
      });
    } catch (err) {
      callback(err as Error);
    }
  };

  cors(corsOptionsDelegate)(req, res, next);
};
