import { withDbAndCors } from "@/server/utils/withDbAndCors";
import { NextRequest } from "next/server";
import { runMiddlewares } from "@/server/utils/middlewareControll";
import { verifyAuth } from "@/server/middlewares/auth.middleware";
import { deleteProduct } from "@/server/controllers/product.controller";
import { userRoles } from "@/server/enums/store.enum";
import { verifyStoreAccess } from "@/server/middlewares/verifyStoreAccess.middleware";

export const DELETE = withDbAndCors(async (req: NextRequest, { params }) => {
  const allowed_roles = [userRoles.ADMIN, userRoles.OWNER, userRoles.MANAGER];
  const context = await runMiddlewares(
    req,
    [
      verifyAuth,
      (req, context, params) =>
        verifyStoreAccess(req, context, params, allowed_roles),
    ],
    params,
  );

  return await deleteProduct(req, context, params);
});
