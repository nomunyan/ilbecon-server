import mongoose, { Schema, Document, Types } from "mongoose";

export interface IIBcon extends Document {
  title: string;
  source: string;
  tags: Types.Array<string>;
  images: Types.Array<string>;
}
const IBconSchema: Schema = new Schema({
  title: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  tags: { type: [String], required: true },
  images: { type: [String], required: true },
});

export default mongoose.model<IIBcon>("IBcon", IBconSchema);
