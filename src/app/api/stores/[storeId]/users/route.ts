import { withDbAndCors } from "@/server/utils/withDbAndCors";
import { NextRequest } from "next/server";
import { runMiddlewares } from "@/server/utils/middlewareControll";
import { verifyAuth } from "@/server/middlewares/auth.middleware";
import { userRoles } from "@/server/enums/store.enum";
import { verifyStoreAccess } from "@/server/middlewares/verifyStoreAccess.middleware";
import { addStoreUser, getStoreUsers } from "@/server/controllers/store-access.controller";

export const GET = withDbAndCors(async (req: NextRequest, { params }) => {
  const allowed_roles = [userRoles.OWNER, userRoles.ADMIN, userRoles.MANAGER];
  const context = await runMiddlewares(
    req,
    [
      verifyAuth,
      (req, context, params) =>
        verifyStoreAccess(req, context, params, allowed_roles),
    ],
    params,
  );
  return await getStoreUsers(req, context, params);
});

export const POST = withDbAndCors(async (req: NextRequest, { params }) => {
  const allowed_roles = [userRoles.OWNER, userRoles.ADMIN];
  const context = await runMiddlewares(
    req,
    [
      verifyAuth,
      (req, context, params) =>
        verifyStoreAccess(req, context, params, allowed_roles),
    ],
    params,
  );
  return await addStoreUser(req, context, params);
});
