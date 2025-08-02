import mongoose from "mongoose";
import { Env } from "./env.config";

const connectDatabase = async () => {
    try {
        if (Env.MONGO_URI_RMOTE) {
            await mongoose.connect(Env.MONGO_URI_RMOTE);
            console.log("Connected to Remote Mongo database for logging");
        } else {
            console.log("MongoDB connection not configured - logging disabled");
        }
    } catch (error) {
        console.log("Error connecting to Mongo database for logging");
        // Don't exit process for API Gateway, just log the error
        console.error(error);
    }
};

export default connectDatabase; 