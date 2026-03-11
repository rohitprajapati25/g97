const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config({ path: __dirname + "/.env" });
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const connectDB = require("./config/db");

// Validate critical environment variables at startup
const requiredEnvVars = ['JWT_SECRET'];
// Check both MONGODB_URI and MONGO_URI (support both naming conventions)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please create a .env file with the following variables:');
  console.error('JWT_SECRET=your_jwt_secret_key');
  console.error('MONGODB_URI=your_mongodb_connection_string');
  // Don't exit in development - allow it to run with warnings
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const app = express();

// CORS configuration - allow all origins for production
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(helmet()); // set security headers
// compress responses to reduce payload size
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// simple request logging in dev
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Connect to DB (only if not in serverless environment)
if (process.env.VERCEL === undefined) {
  connectDB();
}

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

const PORT = process.env.PORT || 5000;

// For local development
if (process.env.VERCEL === undefined) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;

