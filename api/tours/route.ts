// app/api/tours/route.ts
import dbConnect from "@/lib/dbConnect";
import Tour from "@/models/Tour";

export async function GET() {
  await dbConnect();
  const tours = await Tour.find({}).lean();
  return Response.json(tours);
}