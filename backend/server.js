const express = require("express");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");





const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
                                           

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
