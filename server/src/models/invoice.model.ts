import mongoose, {
  model,
  Schema,
  InferSchemaType,
  PaginateModel,
  AggregatePaginateModel,
} from "mongoose";
import { pricePerQuantitySchema } from "./product.model";
import { invoiceEnums } from "../enums/invoice.enum";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const billItemSchema = new Schema(
  {
    id: {
      type: Number,
      default: 1,
    },
    product: {
      id: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
      name: {
        type: String,
      },
      sku: {
        type: String,
      },
    },
    pricePerQuantity: {
      type: pricePerQuantitySchema,
    },
    netQuantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    stockUnit: {
      type: String,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const invoiceExtraData = new Schema(
  {
    customer: {
      name: String,
      phoneNumber: String,
      address: String,
    },
  },
  { _id: false, strict: false },
);

const invoiceSchema = new Schema(
  {
    creatorId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: mongoose.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
    },
    invoiceNumber: {
      type: String,
      required: true,
      index: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    billItems: {
      type: [billItemSchema],
      default: [],
    },
    subTotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    roundupTotal: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
    },
    status: {
      type: String,
      enum: invoiceEnums.invoiceStatus,
      default: "DRAFTED",
    },
    extraData: invoiceExtraData,
  },
  { timestamps: true },
);

invoiceSchema.plugin(mongoosePaginate);
invoiceSchema.plugin(aggregatePaginate);

export type InvoiceModelType = InferSchemaType<typeof invoiceSchema>;

export type InvoiceDocument = mongoose.HydratedDocument<InvoiceModelType>;

type InvoiceModel = PaginateModel<InvoiceModelType> &
  AggregatePaginateModel<InvoiceModelType>;

export const Invoice = model<InvoiceModelType, InvoiceModel>(
  "Invoice",
  invoiceSchema,
);
