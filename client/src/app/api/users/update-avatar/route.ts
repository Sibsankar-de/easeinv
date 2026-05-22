import { updateAvatar } from "@/server/controllers/user.controller"
import { withDbAndCors } from "@/server/utils/withDbAndCors"
import { NextRequest } from "next/server"
import { runMiddlewares } from "@/server/utils/middlewareControll";
import { verifyAuth } from "@/server/middlewares/auth.middleware";
import { fileHandle } from "@/server/middlewares/fileHandle.middleware";

export const PATCH = withDbAndCors(async (req: NextRequest) => {
    const context = await runMiddlewares(req, [verifyAuth, fileHandle])
    return await updateAvatar(req, context);
}) 