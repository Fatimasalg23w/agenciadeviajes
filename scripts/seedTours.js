import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import toursData from "./toursData.json";

async function seed() {
  await mongoose.connect("mongodb://localhost:27017/explore-mexico");
  await Tour.deleteMany({});
  await Tour.insertMany(toursData);
  console.log("✅ Tours insertados en MongoDB");
  process.exit();
}

seed();
