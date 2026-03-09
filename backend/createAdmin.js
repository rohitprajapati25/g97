require("dotenv").config();   // 🔥 FIRST LINE


const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const connectDB = require("./config/db");

connectDB();

(async () => {
  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email: "pr4901958@gmail.com" });
  if (existingAdmin) {
    console.log("Admin already exists with email: pr4901958@gmail.com");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("123456", 10);

  await Admin.create({
    name: "Admin",
    email: "pr4901958@gmail.com",
    phone: "9104318605",
    password: hashedPassword,
  });

  console.log("Admin created successfully!");
  process.exit();
})();

