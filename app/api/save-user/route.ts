import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

function generateClientNumber(nacionalidad: string) {
  const prefix = "MX";
  const datePart = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${datePart}-${nacionalidad}-${randomPart}`;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const cleanEmail = String(body.email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "El correo ya está registrado." },
        { status: 400 }
      );
    }

    // 🔒 Hash de contraseña
    const passwordHash = await bcrypt.hash(body.password, 10);
    const clientNumber = generateClientNumber(body.paisResidencia);

    const user = new User({
      nombre: body.nombre,
      apellido: body.apellido,
      fechaNacimiento: body.fechaNacimiento,
      email: cleanEmail,
      telefono: body.telefono,
      passwordHash,
      status: "verified",
      clientNumber,
      nacionalidad: body.paisResidencia,
      sexo: body.sexo,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Usuario registrado y verificado.",
      clientNumber,
    });
  } catch (error: any) {
    console.error("Error en /api/save-user:", error.message);
    return NextResponse.json(
      { success: false, message: "Error al registrar usuario." },
      { status: 500 }
    );
  }
}
