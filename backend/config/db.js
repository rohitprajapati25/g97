const mongoose = require("mongoose");

// if the environment variable is missing, assume a local instance on 27017
const DEFAULT_URI = "mongodb://localhost:27017/g97";

// MongoDB connection options for better reliability
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || DEFAULT_URI;
    
    // Log which URI is being used (mask password for security)
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@');
    console.log("Connecting to MongoDB:", maskedUri);
    
    await mongoose.connect(uri, mongoOptions);
    console.log("MongoDB Connected successfully");
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    // Don't exit on connection error - let the server continue to run
    // This allows the app to at least start and respond to health checks
  }
};

module.exports = connectDB;
