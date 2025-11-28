import mongoose from "mongoose";

const ItinerarioSchema = new mongoose.Schema({
  dia: Number,
  ciudad: String,
  actividad: String,
  hotel_sugerido: String,
});

const TourSchema = new mongoose.Schema({
  nombre: String,
  destinos: [String],
  descripcion: String,
  precio: Number,
  precio_base: Number,
  fecha_inicio: String,
  fecha_fin: String,
  imagenes: [String],
  hoteles_por_destino: Object,
  itinerario: [ItinerarioSchema],
});

export default mongoose.models.Tour || mongoose.model("Tour", TourSchema);
