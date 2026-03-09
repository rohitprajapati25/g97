const mongoose = require("mongoose");

// if the environment variable is missing, assume a local instance on 27017
const DEFAULT_URI = "mongodb://localhost:27017/g97";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || DEFAULT_URI;
    await mongoose.connect(uri);
    console.log("MongoDB Connected to", uri);
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
