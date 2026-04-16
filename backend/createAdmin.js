require("dotenv").config();   // 🔥 FIRST LINE


const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const connectDB = require("./config/db");

connectDB();

(async () => {
  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email: "rohit@gmail.com" });
  if (existingAdmin) {
    console.log("Admin already exists with email: rohit@gmail.com");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("123456", 10);

  await Admin.create({
    name: "Admin",
    email: "rohit@gmail.com",
    phone: "9898989898",
    password: hashedPassword,
  });

  console.log("Admin created successfully!");
  process.exit();
})();

