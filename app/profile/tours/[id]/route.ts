// app/api/tours/[id]/route.ts
import dbConnect from "@/lib/dbConnect";
import Tour from "@/models/Tour";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const tour = await Tour.findById(params.id).lean();
  if (!tour) return new Response("Tour no encontrado", { status: 404 });
  return Response.json(tour);
}
