import dbConnect from "@/lib/dbConnect";
import Tour, { ITour } from "@/models/Tour";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const tours: ITour[] = await Tour.find({}).exec(); // 👈 usa .exec() para tipado correcto
    return NextResponse.json(tours);
  } catch (error) {
    console.error("Error en GET /api/tours:", error);
    return NextResponse.json({ error: "Error interno en el servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const nuevoTour = await Tour.create(body);

    return NextResponse.json(nuevoTour, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/tours:", error);
    return NextResponse.json({ error: "Error interno en el servidor" }, { status: 500 });
  }
}
