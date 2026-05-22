import mongoose, {
  Schema,
  models,
  InferSchemaType,
  PaginateModel,
} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
  generatePasswordResetToken(): Promise<string>;
  getAccessToken(): Promise<string>;
  getRefreshToken(): Promise<string>;
  getLogoutToken(): Promise<string>;
}

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    authBy: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "USER",
      enum: ["USER", "ADMIN"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

// hash the password before storing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// method to check the password
userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// get the password reset token
userSchema.methods.generatePasswordResetToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.PASSWORD_RESET_TOKEN_SECRET,
    {
      expiresIn: "1h",
    },
  );
};

// generate accesstoken
userSchema.methods.getAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

// generate refreshtoken
userSchema.methods.getRefreshToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

export type UserModelType = InferSchemaType<typeof userSchema> & UserMethods;

// setting devmode
if (process.env.NODE_ENV === "development" && models.User) {
  delete models.User;
}

export const User =
  (models.User as PaginateModel<UserModelType>) ||
  mongoose.model<UserModelType, PaginateModel<UserModelType>>(
    "User",
    userSchema,
  );
