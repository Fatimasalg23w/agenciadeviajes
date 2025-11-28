// scripts/seedTours.ts
import mongoose from "mongoose";
import Tour from "../models/Tour";
import toursData from "../data/toursData.json";

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/agenciadeviajes";
  await mongoose.connect(uri);
  await Tour.deleteMany({});
  await Tour.insertMany(toursData as any[]);
  console.log("✅ Tours insertados");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
