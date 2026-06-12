import mongoose, { PaginateModel, Schema } from "mongoose";
import { storeEnums } from "../enums/store.enum";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

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

storeUserSchema.plugin(mongoosePaginate);
storeUserSchema.plugin(aggregatePaginate);

export type StoreUserModelType = mongoose.InferSchemaType<typeof storeUserSchema>;

export type StoreUserDocument = mongoose.HydratedDocument<StoreUserModelType>;

export const StoreUser = mongoose.model<
  StoreUserModelType,
  PaginateModel<StoreUserModelType>
>("StoreUser", storeUserSchema);
