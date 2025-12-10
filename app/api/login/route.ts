import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const cleanEmail = String(body.email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado." },
        { status: 400 }
      );
    }

    // 🔒 Validar contraseña
    const isValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Contraseña incorrecta." },
        { status: 400 }
      );
    }

    // 🔑 Extraer solo los campos seguros
    const safeUser = {
      id: user._id.toString(),
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      status: user.status,
      clientNumber: user.clientNumber,
      nacionalidad: user.nacionalidad,
      sexo: user.sexo,
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    console.error("Error en /api/login:", error.message);
    return NextResponse.json(
      { success: false, message: "Error al iniciar sesión." },
      { status: 500 }
    );
  }
}
