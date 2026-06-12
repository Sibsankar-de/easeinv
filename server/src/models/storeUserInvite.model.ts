import mongoose, { InferSchemaType, PaginateModel, Schema } from "mongoose";
import { storeEnums } from "../enums/store.enum";
import { isAfter } from "../utils/date-utils";

interface StoreUserInviteMethods {
  isExpired(): boolean;
}

const storeUserInviteSchema = new Schema(
  {
    storeId: {
      type: mongoose.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: storeEnums.USER_ROLES,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

storeUserInviteSchema.index({ storeId: 1, email: 1 }, { unique: true });

storeUserInviteSchema.methods.isExpired = function (): boolean {
  return isAfter(new Date(), this.expiresAt);
};

export type StoreUserInviteModelType = InferSchemaType<
  typeof storeUserInviteSchema
> &
  StoreUserInviteMethods;

export type StoreUserInviteDocument =
  mongoose.HydratedDocument<StoreUserInviteModelType>;

export const StoreUserInvite = mongoose.model<
  StoreUserInviteModelType,
  PaginateModel<StoreUserInviteModelType>
>("StoreUserInvite", storeUserInviteSchema);
