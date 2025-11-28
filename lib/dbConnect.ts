// lib/dbConnect.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/agenciadeviajes";

declare global {
  var mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

global.mongooseConn = global.mongooseConn || { conn: null, promise: null };

export default async function dbConnect() {
  if (global.mongooseConn.conn) return global.mongooseConn.conn;

  if (!global.mongooseConn.promise) {
    global.mongooseConn.promise = mongoose.connect(MONGODB_URI);
  }
  global.mongooseConn.conn = await global.mongooseConn.promise;
  return global.mongooseConn.conn;
}
