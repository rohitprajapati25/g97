const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");

// mailer setup (use Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});


// Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    if (!phone) return res.status(400).json({ message: "Phone number required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    res.json({ message: "Admin Registered" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

// ====== admin helpers ======
exports.getProfile = async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select("-password");
  if (!admin) return res.sendStatus(404);
  res.json(admin);
};

// ====== update admin profile ======
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const adminId = req.admin.id;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Check if email is being changed and if it's already in use
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      admin.email = email;
    }

    if (name) admin.name = name;
    if (phone) admin.phone = phone;

    await admin.save();

    res.json({
      message: "Profile updated successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

// ====== change password ======
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password change failed" });
  }
};

// ====== two-factor helpers ======
exports.generate2FA = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.sendStatus(404);

    const secret = speakeasy.generateSecret({
      name: `G97 Admin (${admin.email})`,
    });

    // temporarily store secret; will be activated on verify
    admin.twoFactorSecret = secret.base32;
    admin.twoFactorEnabled = false;
    await admin.save();

    res.json({
      otpauthUrl: secret.otpauth_url,
      base32: secret.base32,
    });
  } catch (err) {
    res.status(500).json({ message: "2FA generation failed" });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const admin = await Admin.findById(req.admin.id);
    if (!admin || !admin.twoFactorSecret) return res.sendStatus(404);

    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });
    if (!verified) {
      return res.status(400).json({ message: "Invalid 2FA code" });
    }

    admin.twoFactorEnabled = true;
    await admin.save();
    res.json({ message: "2FA enabled" });
  } catch (err) {
    res.status(500).json({ message: "2FA verification failed" });
  }
};

// Login Admin
// helper to send OTP via email
async function sendOtp(admin) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  admin.otpCode = code;
  admin.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  await admin.save();

  const text = `Your login code is ${code}. It expires in 5 minutes.`;

  // send email - only if credentials are properly configured
  const isValidEmail = process.env.MAIL_USER && 
                        process.env.MAIL_USER !== "your-email@gmail.com" &&
                        process.env.MAIL_PASS && 
                        process.env.MAIL_PASS.length > 15 &&
                        !process.env.MAIL_PASS.includes("your-");
  
  if (isValidEmail) {
    transporter.sendMail({
      from: process.env.MAIL_USER,
      to: admin.email,
      subject: "Your AutoHub Admin Login OTP",
      text,
    }).catch(err => {
      console.error("Email send failed:", err.message);
      console.log(`[FALLBACK DEV MODE] OTP for ${admin.email}: ${code}`);
    });
  } else {
    console.log(`[DEV MODE] OTP for ${admin.email}: ${code}`);
  }

}

// Login Admin - Simplified (no OTP required)
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log(`Admin login attempt with non-existent email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log(`Admin login attempt with wrong password for: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error. Please contact admin." });
    }

    // Generate token directly without OTP
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, admin: { id: admin._id, email: admin.email } });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

