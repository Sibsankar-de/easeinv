import { loginUser } from "@/server/controllers/user.controller"
import { withDbAndCors } from "@/server/utils/withDbAndCors"
import { NextRequest } from "next/server"

export const POST = withDbAndCors(async (req: NextRequest) => {
    return await loginUser(req);
}) 