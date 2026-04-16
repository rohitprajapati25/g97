const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config({ path: __dirname + "/.env" });
} else {
  require("dotenv").config();
}

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const connectDB = require("./config/db");

// Validate critical env vars
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is missing");
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

const app = express();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for login endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later" }
});

// CORS — allow configured origins or all in dev
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : true; // allow all in dev

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV || "development" });
});

// Connect to DB
if (mongoUri) {
  connectDB();
} else {
  console.warn("⚠️  No MongoDB URI found — database not connected");
}

// Routes — apply stricter rate limit to auth endpoints
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api/admin/login", authLimiter);

app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err.message || err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});



const http = require('http');
const socketIo = require('socket.io');
const socketHandler = require('./socketHandler');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Socket.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins === true ? "*" : allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  }
});

socketHandler(io);

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// For local development
if (process.env.VERCEL === undefined) {
  server.listen(PORT, () => {
    console.log(`Server + Socket running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;

