import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const productImageSchema = new Schema(
  {
    productId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    imageId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "GalleryImage",
    },
    priority: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

export type ProductImageModelType = InferSchemaType<typeof productImageSchema>;

export type ProductImageDocument = mongoose.HydratedDocument<ProductImageModelType>;

export const ProductImage = model<ProductImageModelType>(
  "ProductImage",
  productImageSchema,
);
