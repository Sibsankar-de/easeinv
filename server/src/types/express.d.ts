import { UserModelType } from "../models/user.model";
import { StoreModelType } from "../models/store.model";

declare global {
  namespace Express {
    interface Request {
      user?: UserModelType;
      store?: StoreModelType;
    }
  }
}
