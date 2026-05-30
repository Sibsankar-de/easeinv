import mongoose, {
  model,
  Schema,
  InferSchemaType,
  PaginateModel,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

interface StoreMethods {
  _id: mongoose.Types.ObjectId;
}

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
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    contactNo: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    currencyCode: {
      type: String,
      required: true,
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

export type StoreModelType = InferSchemaType<typeof storeSchema> & StoreMethods;

export const Store = model<StoreModelType, PaginateModel<StoreModelType>>(
  "Store",
  storeSchema,
);
