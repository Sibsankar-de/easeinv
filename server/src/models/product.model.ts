import mongoose, {
  model,
  Schema,
  InferSchemaType,
  PaginateModel,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { AggregatePaginateModel } from "mongoose";

interface ProductMethods {
  _id: mongoose.Types.ObjectId;
}

export const pricePerQuantitySchema = new Schema(
  {
    id: {
      type: Number,
      default: 1,
    },
    price: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    profitMargin: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const productSchema = new Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    gtin: {
      type: String,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
    },
    thumbnailImageId: {
      type: mongoose.Types.ObjectId,
      ref: "GalleryImage",
    },
    categories: {
      type: [mongoose.Types.ObjectId],
      ref: "Category",
      default: [],
    },
    buyingPricePerQuantity: {
      type: Number,
      required: true,
    },
    totalStock: {
      type: Number,
      required: function () {
        return this.enabledInventoryTracking;
      },
    },
    enabledInventoryTracking: {
      type: Boolean,
      default: false,
    },
    stockUnit: {
      type: String,
      required: true,
    },
    pricePerQuantity: {
      type: [pricePerQuantitySchema],
      default: [],
    },
  },
  { timestamps: true },
);

productSchema.index(
  { storeId: 1, name: 1 },
  { collation: { locale: "en", strength: 2 } },
);
productSchema.index(
  { storeId: 1, sku: 1 },
  { collation: { locale: "en", strength: 2 } },
);
productSchema.index(
  { storeId: 1, gtin: 1 },
  { collation: { locale: "en", strength: 2 } },
);

productSchema.plugin(mongoosePaginate);
productSchema.plugin(aggregatePaginate);

export type ProductModelType = InferSchemaType<typeof productSchema> &
  ProductMethods;
type ProductModel = PaginateModel<ProductModelType> &
  AggregatePaginateModel<ProductModelType>;

export const Product = model<ProductModelType, ProductModel>(
  "Product",
  productSchema,
);
