import { withDbAndCors } from "@/server/utils/withDbAndCors"
import { NextRequest } from "next/server"
import { runMiddlewares } from "@/server/utils/middlewareControll";
import { verifyAuth } from "@/server/middlewares/auth.middleware";
import { getStoreList } from "@/server/controllers/store.controller";

export const GET = withDbAndCors(async (req: NextRequest) => {
    const context = await runMiddlewares(req, [verifyAuth])
    
    return await getStoreList(req, context);
});