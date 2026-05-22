import { withDbAndCors } from "@/server/utils/withDbAndCors";
import { NextRequest } from "next/server";
import { googleOauthCallback } from "@/server/controllers/oauth.controller";

export const GET = withDbAndCors(async (req: NextRequest) => {
  return await googleOauthCallback(req);
});
