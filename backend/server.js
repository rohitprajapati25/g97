const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config({ path: __dirname + "/.env" });
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const connectDB = require("./config/db");

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// simple request logging in dev
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

connectDB();
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

