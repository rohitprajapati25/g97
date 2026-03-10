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

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

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

    // Always require OTP - if not provided, generate and send one
    if (!otp) {
      await sendOtp(admin);
      return res.status(200).json({ 
        message: "OTP sent to your email",
        otpRequired: true 
      });
    }

    // verify OTP
    if (!admin.otpCode || admin.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }
    if (otp !== admin.otpCode) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // clear OTP after successful verification
    admin.otpCode = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, admin: { id: admin._id, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

