import mongoose, {
  AggregatePaginateModel,
  InferSchemaType,
  PaginateModel,
  Schema,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import {
  apiKeyScopeList,
  apiKeyStatus,
  apiKeyStatusList,
} from "../enums/apiKey.enum";

const apiKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    scopes: {
      type: [String],
      enum: apiKeyScopeList,
      default: [],
    },
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: apiKeyStatusList,
      default: apiKeyStatus.ACTIVE,
    },
  },
  { timestamps: true },
);

apiKeySchema.index({ key: 1, storeId: 1 }, { unique: true });
apiKeySchema.index(
  { storeId: 1, name: 1 },
  { collation: { locale: "en", strength: 2 } },
);

apiKeySchema.plugin(mongoosePaginate);
apiKeySchema.plugin(aggregatePaginate);

export type ApiKeyModelType = InferSchemaType<typeof apiKeySchema>;
export type ApiKeyDocument = mongoose.HydratedDocument<ApiKeyModelType>;

type ApiKeyModel = PaginateModel<ApiKeyDocument> &
  AggregatePaginateModel<ApiKeyDocument>;

export const ApiKey = mongoose.model<ApiKeyModelType, ApiKeyModel>(
  "ApiKey",
  apiKeySchema,
);
