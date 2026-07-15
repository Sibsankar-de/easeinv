import type { Store, SafeUser } from "./model";

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      store?: Store;
    }
  }
}
