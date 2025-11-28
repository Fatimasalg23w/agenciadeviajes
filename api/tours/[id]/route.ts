import Tour from "@/models/Tour";
import dbConnect from "@/lib/dbConnect";

// GET: detalle de un tour por ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const tour = await Tour.findById(params.id);
  if (!tour) {
    return new Response("Tour no encontrado", { status: 404 });
  }
  return Response.json(tour);
}
