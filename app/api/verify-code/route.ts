import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, code } = await req.json();

    const cleanEmail = String(email || "").trim().toLowerCase();
    const inputCode = String(code || "").trim();

    if (!cleanEmail || !inputCode) {
      return NextResponse.json({ success: false, message: "Faltan datos." });
    }

    console.log("Verificando usuario:", cleanEmail, "con código:", inputCode);

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      console.warn("Usuario no encontrado con email:", cleanEmail);
      return NextResponse.json({ success: false, message: "Usuario no encontrado." });
    }

    console.log("Usuario encontrado:", user.email, "status:", user.status, "verificationCode:", user.verificationCode);

    if (user.verificationCode !== inputCode) {
      return NextResponse.json({ success: false, message: "Código incorrecto." });
    }

    user.status = "verified";
    user.verificationCode = ""; // opcional: limpiar el código después de verificar
    await user.save();

    return NextResponse.json({ success: true, message: "Usuario verificado." });
  } catch (err: any) {
    console.error("Error en /api/verify-code:", err.message, err);
    return NextResponse.json({ success: false, message: "Error al verificar." });
  }
}
