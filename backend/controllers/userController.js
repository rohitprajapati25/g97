const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const isValidEmail = process.env.MAIL_USER && 
                      process.env.MAIL_USER !== "your-email@gmail.com" &&
                      process.env.MAIL_PASS && 
                      process.env.MAIL_PASS.length > 15 &&
                      !process.env.MAIL_PASS.includes("your-");
  
  if (isValidEmail) {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Your AutoHub Verification Code",
        text: `Your verification code is: ${otp}. This code expires in 10 minutes.`,
      });
      return true;
    } catch (err) {
      console.error("Email send failed:", err.message);
      return false;
    }
  } else {
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    return true;
  }
};

/* ================= REGISTER ================= */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create user with OTP (not verified yet)
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      role: "user",
      isVerified: false,
      otpCode: otp,
      otpExpires: otpExpires,
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "Registration successful. Please verify your email with OTP.",
      userId: user._id,
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

/* ================= VERIFY OTP ================= */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Check OTP validity
    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Verify user
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};

/* ================= RESEND OTP ================= */
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otpCode = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ message: "New OTP sent to your email" });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ message: "Failed to resend OTP", error: err.message });
  }
};

/* ================= LOGIN ================= */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error. Please contact admin." });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first. Check your inbox for OTP." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user._id,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({
      token,
      role: "user",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error("User login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

