const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
// Load .env file for local development only
// In production (Render/Vercel), use environment variables set in dashboard
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config({ path: __dirname + "/.env" });
} else {
  // For production, just ensure config is loaded
  require("dotenv").config();
}
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

// Connect to DB
// For local development: always connect
// For production (Render/Vercel): always connect (web service, not serverless)
const isLocal = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';

if (isLocal) {
  connectDB();
} else {
  // Production - try to connect, but don't fail if MongoDB URI is missing in dev
  if (mongoUri) {
    connectDB();
    console.log("✅ Production mode: Database connection initiated");
  }
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

