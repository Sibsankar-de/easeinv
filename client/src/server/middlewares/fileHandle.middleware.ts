import { MiddlewareContext } from "@/types/middleware";
import { NextRequest } from "next/server";

export const fileHandle = async (
  req: NextRequest,
  context: MiddlewareContext,
): Promise<MiddlewareContext> => {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) return context;
  const clonedReq = req.clone();
  const formData = await clonedReq.formData();
  const files: Record<string, File> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      files[key] = value;
    }
  }

  return { ...context, files };
};
