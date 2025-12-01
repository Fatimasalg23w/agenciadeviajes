// app/api/verify-code/route.ts
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

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado." });
    }

    if (user.code !== inputCode) {
      return NextResponse.json({ success: false, message: "Código incorrecto." });
    }

    user.status = "verified";
    user.code = ""; // opcional: limpiar el código después de verificar
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error al verificar." });
  }
}
