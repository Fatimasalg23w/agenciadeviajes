// models/Tour.ts
import mongoose, { Schema, Model, models } from "mongoose";

const ItinerarioSchema = new Schema({
  dia: { type: Number, required: true },
  ciudad: { type: String, required: true },
  actividad: { type: String, required: true },
  hotel_sugerido: { type: String },
  fecha: { type: String },
  costo_actividad: { type: Number },
});

const TourSchema = new Schema(
  {
    nombre: { type: String, required: true },
    destinos: { type: [String], required: true },
    descripcion: { type: String },
    precio_base: { type: Number, default: 0 },
    fecha_inicio: { type: String },
    fecha_fin: { type: String },
    imagenes: { type: [String], default: [] },
    hoteles_por_destino: { type: Schema.Types.Mixed }, // { destino: [hotel1, hotel2, ...] }
    proveedor_vuelo_hotel: { type: String, default: "Despegar" },
    itinerario: { type: [ItinerarioSchema], default: [] },
  },
  { timestamps: true }
);

const Tour: Model<any> = models.Tour || mongoose.model("Tour", TourSchema);
export default Tour;
