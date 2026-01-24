const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const connectDB = require("./config/db");

connectDB();

(async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await Admin.create({
    email: "admin2@gmail.com",
    password: hashedPassword,
  });

  console.log("Admin created");
  process.exit();
})();
