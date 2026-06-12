import mongoose, {
  InferSchemaType,
  PaginateModel,
  Schema,
  AggregatePaginateModel,
  model,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const galleryImageSchema = new Schema(
  {
    storeId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

galleryImageSchema.index({ storeId: 1, hash: 1 });
galleryImageSchema.index(
  { storeId: 1, name: 1 },
  { collation: { locale: "en", strength: 2 } },
);

galleryImageSchema.plugin(mongoosePaginate);
galleryImageSchema.plugin(aggregatePaginate);

export type GalleryImageModelType = InferSchemaType<typeof galleryImageSchema>;

export type GalleryImageDocument = mongoose.HydratedDocument<GalleryImageModelType>;

type GalleryImageModel = PaginateModel<GalleryImageModelType> &
  AggregatePaginateModel<GalleryImageModelType>;

export const GalleryImage = model<GalleryImageModelType, GalleryImageModel>(
  "GalleryImage",
  galleryImageSchema,
);
