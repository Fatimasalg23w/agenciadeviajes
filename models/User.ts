import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  fechaNacimiento: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  passwordHash: { type: String, required: true }, // 🔒 login seguro
  status: { type: String, enum: ["pending", "verified"], default: "verified" },
  clientNumber: { type: String, required: true },
  nacionalidad: { type: String, required: true },
  sexo: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
