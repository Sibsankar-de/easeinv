import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "./corsHeaders";
import { connectMongo } from "../db/connect-mongo";
import { ApiError } from "./error-handler";

type RouteHandler = (
  req: NextRequest,
  context: { params: Record<string, any> },
) => Promise<NextResponse>;

export const withDbAndCors =
  (handler: RouteHandler): RouteHandler =>
  async (req, context) => {
    try {
      if (req.method === "OPTIONS") {
        return new NextResponse(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      await connectMongo();

      const response = await handler(req, context);

      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error: any) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            errors: error.errors,
          },
          {
            status: error.statusCode,
            headers: corsHeaders,
          },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }
  };
