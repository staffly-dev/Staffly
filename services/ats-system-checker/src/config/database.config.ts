import mongoose from "mongoose";
import { Env } from "./env.config";

const connectDatabase = async () => {
  try {
    await mongoose.connect(Env.MONGODB_URL);
    console.log("Connected to MongoDB database:", Env.MONGODB_DATABASE);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
  }
};

export { connectDatabase, disconnectDatabase };
export default connectDatabase;

