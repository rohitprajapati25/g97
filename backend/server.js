// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const compression = require("compression");
// const morgan = require("morgan");
// require("dotenv").config({ path: __dirname + "/.env" });
// const userRoutes = require("./routes/userRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const connectDB = require("./config/db");


// const app = express();

// // CORS configuration - allow all origins for production
// const corsOptions = {
//   origin: true, // Allow all origins
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// };

// app.use(helmet()); // set security headers
// // compress responses to reduce payload size
// app.use(compression());
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// // simple request logging in dev
// app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// connectDB();
// app.use("/api/user", userRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/uploads", express.static("uploads"));
// app.use("/api/services", require("./routes/serviceRoutes"));
// app.use("/api/products", require("./routes/productRoutes"));
// app.use("/api/bookings", require("./routes/bookingRoutes"));
// app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config({ path: __dirname + "/.env" });

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Security + performance middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS config
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to MongoDB
connectDB();

// ----------------- API ROUTES -----------------
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/uploads", express.static("uploads"));

// ----------------- REACT FRONTEND -----------------
// Serve React static files
app.use(express.static(path.join(__dirname, "client", "build")));

// Fallback route for React Router (all non-API requests)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// ----------------- SERVER LISTEN -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});