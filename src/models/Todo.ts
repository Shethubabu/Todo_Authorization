import mongoose, { Schema, Document } from "mongoose";

export interface ITodo extends Document {
  title: string;
  description: string;
  status: "pending" | "completed";
  userId: mongoose.Types.ObjectId;
}

const TodoSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
}, { timestamps: true });

export default mongoose.model<ITodo>("Todo", TodoSchema);