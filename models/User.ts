// models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  email: string;
  telefono: string;
  passwordHash: string;   // contraseña encriptada con bcrypt
  code: string;           // código de verificación
  status: "pending" | "verified";
  clientNumber: string;   // número único de cliente
}

const UserSchema = new Schema<IUser>(
  {
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    fechaNacimiento: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telefono: { type: String, required: true },
    passwordHash: { type: String, required: true }, // bcrypt hash
    code: { type: String, required: true },
    status: { type: String, enum: ["pending", "verified"], default: "pending" },
    clientNumber: { type: String, required: true, unique: true }, // número único
  },
  { timestamps: true }
);

// índices únicos para búsquedas rápidas
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ clientNumber: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
