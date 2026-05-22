import mongoose, { models, PaginateModel, Schema } from "mongoose";
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

type StoreUser = mongoose.InferSchemaType<typeof storeUserSchema>;

if (process.env.NODE_ENV === "development" && models.StoreUser) {
  delete models.StoreUser;
}

export const StoreUser =
  (models.StoreUser as PaginateModel<StoreUser>) ||
  mongoose.model<StoreUser, PaginateModel<StoreUser>>(
    "StoreUser",
    storeUserSchema,
  );
