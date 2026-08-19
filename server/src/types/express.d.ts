import type { ApiKey, Store, StoreUserRole, User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      store?: Store;
      storeUserRole?: StoreUserRole;
      apiKey?: ApiKey;
    }
  }
}
