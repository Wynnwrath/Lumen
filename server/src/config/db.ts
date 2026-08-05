import mongoose from "mongoose";
import { config } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB connected:", config.mongodbUri);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
