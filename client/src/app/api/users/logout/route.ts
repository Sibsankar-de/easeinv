import { logoutUser } from "@/server/controllers/user.controller"
import { withDbAndCors } from "@/server/utils/withDbAndCors"
import { NextRequest } from "next/server"
import { runMiddlewares } from "@/server/utils/middlewareControll";
import { verifyAuth } from "@/server/middlewares/auth.middleware";

export const GET = withDbAndCors(async (req: NextRequest) => {
    const context = await runMiddlewares(req, [verifyAuth])
    return await logoutUser(req);
}) 