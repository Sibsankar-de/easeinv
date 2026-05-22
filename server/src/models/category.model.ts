import mongoose, {
  Schema,
  InferSchemaType,
  PaginateModel,
} from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

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

export type CategoryModelType = InferSchemaType<typeof categorySchema>;

export const Category = mongoose.model<
  CategoryModelType,
  PaginateModel<CategoryModelType>
>("Category", categorySchema);
