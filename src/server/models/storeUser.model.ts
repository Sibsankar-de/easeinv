import mongoose, { Schema } from "mongoose";
import { storeEnums } from "../enums/store.enum";

const storeUserSchema = new Schema(
  {
    storeId: {
      type: mongoose.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: storeEnums.USER_ROLES,
      required: true,
    },
  },
  { timestamps: true },
);

type StoreUser = mongoose.InferSchemaType<typeof storeUserSchema>;

export const StoreUser = mongoose.model<StoreUser>(
  "StoreUser",
  storeUserSchema,
);
