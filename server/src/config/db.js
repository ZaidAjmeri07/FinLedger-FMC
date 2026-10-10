import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

let isConnecting = false;
let retryTimeout = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  isConnecting = true;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    isConnecting = false;
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
  } catch (err) {
    isConnecting = false;
    console.error(`MongoDB connection attempt failed: ${err.message}`);
    console.error(
      "Hint: Check MongoDB Atlas Network Access IP Whitelist (add your current public IP or 0.0.0.0/0 at https://cloud.mongodb.com)."
    );

    // Auto-retry in 5 seconds
    if (!retryTimeout) {
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connectDB();
      }, 5000);
    }
  }
};

export default connectDB;
