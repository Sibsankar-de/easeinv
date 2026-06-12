import mongoose, {
  Schema,
  InferSchemaType,
  PaginateModel,
  AggregatePaginateModel,
} from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

interface CategoryMethods {
  _id: mongoose.Types.ObjectId;
}

const categorySchema = new Schema(
  {
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
  },
  { timestamps: true },
);

categorySchema.index({ name: 1 }, { collation: { locale: "en", strength: 2 } });

categorySchema.plugin(mongoosePaginate);
categorySchema.plugin(aggregatePaginate);

export type CategoryModelType = InferSchemaType<typeof categorySchema> &
  CategoryMethods;

export type CategoryDocument = mongoose.HydratedDocument<CategoryModelType>;

type CategoryModel = PaginateModel<CategoryModelType> &
  AggregatePaginateModel<CategoryModelType>;

export const Category = mongoose.model<CategoryModelType, CategoryModel>(
  "Category",
  categorySchema,
);
