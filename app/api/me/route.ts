import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, message: "Email requerido" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        clientNumber: user.clientNumber,
        nacionalidad: user.nacionalidad,
        puntos: user.puntos || 0,
        reservas: user.reservas || [],
      },
    });
  } catch (error: any) {
    console.error("Error en /api/me:", error.message);
    return NextResponse.json({ success: false, message: "Error al obtener perfil" }, { status: 500 });
  }
}
