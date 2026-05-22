import { withDbAndCors } from "@/server/utils/withDbAndCors";
import { NextRequest } from "next/server";
import { runMiddlewares } from "@/server/utils/middlewareControll";
import { verifyAuth } from "@/server/middlewares/auth.middleware";
import { userRoles } from "@/server/enums/store.enum";
import { verifyStoreAccess } from "@/server/middlewares/verifyStoreAccess.middleware";
import { updateStoreUserRole, removeStoreUser } from "@/server/controllers/store-access.controller";

export const PATCH = withDbAndCors(async (req: NextRequest, { params }) => {
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
  return await updateStoreUserRole(req, context, params);
});

export const DELETE = withDbAndCors(async (req: NextRequest, { params }) => {
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
  return await removeStoreUser(req, context, params);
});
