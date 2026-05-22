import mongoose, {
  model,
  models,
  Schema,
  InferSchemaType,
  PaginateModel,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const customUnitSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const invoiceBankDetailsSchema = new Schema(
  {
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    bankName: { type: String, default: "" },
    bankCode: { type: String, default: "" },
  },
  { _id: false },
);

const storeSettingsSchema = new Schema(
  {
    storeId: {
      type: mongoose.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true,
    },
    invoiceStoreName: {
      type: String,
      default: "",
    },
    invoiceStoreAddress: {
      type: String,
      default: "",
    },
    invoiceFooterNote: {
      type: String,
      default: "",
    },
    invoiceStoreLogoUrl: {
      type: String,
      default: "",
    },
    enableInventoryTracking: {
      type: Boolean,
      default: false,
    },
    roundupInvoiceTotal: {
      type: Boolean,
      default: false,
    },
    defaultDiscountRate: {
      type: Number,
      default: 0,
    },
    defaultTaxRate: {
      type: Number,
      default: 0,
    },
    invoiceNumberPrefix: {
      type: String,
      default: "INV",
    },
    invoiceBankDetails: invoiceBankDetailsSchema,
    invoicePaymentQrCode: {
      type: String,
      default: "",
    },
    customUnits: {
      type: [customUnitSchema],
      default: [],
    },
  },
  { timestamps: true },
);

storeSettingsSchema.plugin(mongoosePaginate);
storeSettingsSchema.plugin(aggregatePaginate);

export type StoreSettingsModelType = InferSchemaType<
  typeof storeSettingsSchema
>;

if (process.env.NODE_ENV === "development" && models.StoreSettings) {
  delete models.StoreSettings;
}

export const StoreSettings =
  (models.StoreSettings as PaginateModel<StoreSettingsModelType>) ||
  model<StoreSettingsModelType, PaginateModel<StoreSettingsModelType>>(
    "StoreSettings",
    storeSettingsSchema,
  );
