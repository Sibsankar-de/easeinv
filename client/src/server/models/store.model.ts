import mongoose, {
  model,
  models,
  Schema,
  InferSchemaType,
  PaginateModel,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const storeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessType: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    contactNo: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
    lastInvoiceNumber: {
      type: String,
    },
    settingsId: {
      type: mongoose.Types.ObjectId,
      ref: "StoreSettings",
    },
  },
  { timestamps: true },
);

storeSchema.plugin(mongoosePaginate);
storeSchema.plugin(aggregatePaginate);

export type StoreModelType = InferSchemaType<typeof storeSchema>;

if (process.env.NODE_ENV === "development" && models.Store) {
  delete models.Store;
}

export const Store =
  (models.Store as PaginateModel<StoreModelType>) ||
  model<StoreModelType, PaginateModel<StoreModelType>>("Store", storeSchema);
