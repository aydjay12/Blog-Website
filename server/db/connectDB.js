import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    mongoose.set("strictQuery", true);

    if (isConnected) {
        console.log("MongoDB is already connected");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
        });

        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Error connection to MongoDB: ", error.message);
        // Don't exit process in serverless, let the error bubble up
        throw error;
    }
};