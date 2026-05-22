import { withDbAndCors } from "@/server/utils/withDbAndCors";
import { NextRequest } from "next/server";
import { runMiddlewares } from "@/server/utils/middlewareControll";
import { verifyAuth } from "@/server/middlewares/auth.middleware";
import { userRoles } from "@/server/enums/store.enum";
import { verifyStoreAccess } from "@/server/middlewares/verifyStoreAccess.middleware";
import { getDashboardAnalytics } from "@/server/controllers/analytics.controller";

export const GET = withDbAndCors(async (req: NextRequest, { params }) => {
  const allowedRoles = [
    userRoles.ADMIN,
    userRoles.OWNER,
    userRoles.MANAGER,
    userRoles.EMPLOYEE,
  ];
  const context = await runMiddlewares(
    req,
    [
      verifyAuth,
      (req, context, params) =>
        verifyStoreAccess(req, context, params, allowedRoles),
    ],
    params,
  );
  return await getDashboardAnalytics(req, context, params);
});
