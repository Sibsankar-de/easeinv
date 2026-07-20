import type { Store, SafeUser } from "./model";
import type { StoreUserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      store?: Store;
      storeUserRole?: StoreUserRole;
    }
  }
}
