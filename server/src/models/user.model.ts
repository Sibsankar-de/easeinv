import mongoose, { Schema, InferSchemaType, PaginateModel } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { env } from "../configs/env";

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
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    env.PASSWORD_RESET_TOKEN_SECRET as string,
    {
      expiresIn: "1h",
    },
  );
};

// generate accesstoken
userSchema.methods.getAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRY as any,
    },
  );
};

// generate refreshtoken
userSchema.methods.getRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRY as any,
    },
  );
};

userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

export type UserModelType = InferSchemaType<typeof userSchema> &
  UserMethods & { _id: mongoose.Types.ObjectId };

export const User = mongoose.model<UserModelType, PaginateModel<UserModelType>>(
  "User",
  userSchema,
);
