import mongoose, { Schema, Document } from "mongoose";

export interface IAuth extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  deviceId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

const AuthSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: String,
    ipAddress: String,
  },
  { timestamps: true }
);

AuthSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export default mongoose.model<IAuth>("Auth", AuthSchema);