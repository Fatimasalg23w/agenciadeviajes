import Tour from "@/models/Tour";
import dbConnect from "@/lib/dbConnect";

// GET: lista todos los tours
export async function GET() {
  await dbConnect();
  const tours = await Tour.find({});
  return Response.json(tours);
}
