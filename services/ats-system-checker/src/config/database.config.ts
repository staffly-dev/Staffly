import mongoose from "mongoose";
import { Env } from "./env.config";

// Suppress Mongoose duplicate index warnings
const originalWarn = process.emitWarning;
process.emitWarning = function (warning: string | Error, ...args: any[]) {
  if (warning && typeof warning === 'object' && 'name' in warning && warning.name === 'MongooseWarning') {
    return; // Suppress Mongoose warnings
  }
  return (originalWarn as any).apply(process, [warning, ...args]);
};

const connectDatabase = async () => {
  try {
    await mongoose.connect(Env.MONGODB_URL);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    // Silent fail
  }
};

export { connectDatabase, disconnectDatabase };
export default connectDatabase;

