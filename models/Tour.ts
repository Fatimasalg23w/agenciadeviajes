import mongoose, { Schema, Document, Model } from "mongoose";

// Interfaz explícita
export interface ITour extends Document {
  name: string;
  city: string;
  price: number;
}

const TourSchema: Schema = new Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  price: { type: Number, required: true },
});

// Modelo tipado
const Tour: Model<ITour> =
  mongoose.models.Tour || mongoose.model<ITour>("Tour", TourSchema);

export default Tour;
