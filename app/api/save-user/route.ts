import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// Genera un código de verificación de 6 dígitos
function generateSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Genera un número único de cliente de 10 dígitos
async function generateUniqueClientNumber() {
  let num: string;
  let exists = true;
  while (exists) {
    num = String(Math.floor(1000000000 + Math.random() * 9000000000)); // 10 dígitos
    const found = await User.findOne({ clientNumber: num }).lean();
    exists = !!found;
  }
  return num;
}

// Valida que la contraseña sea fuerte
function isStrongPassword(pw: string) {
  const strong = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return strong.test(pw);
}

export async function POST(req: Request) {
  try {
    // ✅ Usa dbConnect en lugar de connectDB
    await dbConnect();

    const body = await req.json();

    const nombre = String(body.nombre || "").trim();
    const apellido = String(body.apellido || "").trim();
    const fechaNacimiento = String(body.fechaNacimiento || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const telefono = String(body.telefono || "").trim();
    const password = String(body.password || "");

    // Validación de contraseña fuerte
    if (!isStrongPassword(password)) {
      return NextResponse.json({
        success: false,
        message: "La contraseña debe tener mínimo 8 caracteres con letras, números y símbolos.",
      });
    }

    // Evita duplicados por email
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Este correo ya está registrado.",
      });
    }

    // Encripta la contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Genera número de cliente único y código de verificación
    const clientNumber = await generateUniqueClientNumber();
    const code = generateSixDigitCode();

    // Crea el usuario en la base
    await User.create({
      nombre,
      apellido,
      fechaNacimiento,
      email,
      telefono,
      passwordHash,
      code,
      status: "pending",
      clientNumber,
    });

    return NextResponse.json({ success: true, clientNumber });
  } catch (err: any) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "campo";
      return NextResponse.json({
        success: false,
        message: `Duplicado en ${field}.`,
      });
    }

    return NextResponse.json({
      success: false,
      message: "Error al registrar usuario.",
    });
  }
}
