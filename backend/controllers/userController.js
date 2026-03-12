const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Email transporter setup - Configure properly for production
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // For production, consider proper SSL certificates
    }
  });
};

// Check if email is properly configured
const isEmailConfigured = () => {
  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;
  
  // Strict validation for production
  return mailUser && 
         mailUser.includes('@') &&
         mailPass && 
         mailPass.length > 10 &&
         !mailPass.includes('your-') &&
         !mailPass.includes('xxxx');
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  // Check if email is configured
  if (!isEmailConfigured()) {
    console.error("[EMAIL ERROR] Email not configured! Please set MAIL_USER and MAIL_PASS environment variables.");
    console.log(`[DEV MODE - OTP FOR TESTING] Email: ${email}, OTP: ${otp}`);
    return { success: true, isDevMode: true }; // Return success for dev mode so user can still register
  }
  
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Your AutoHub Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #dc2626;">AutoHub Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #9ca3af; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log(`[EMAIL SENT] OTP sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.error("[EMAIL ERROR] Failed to send OTP:", err.message);
    return { success: false, error: err.message };
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
    const emailResult = await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "Registration successful. Please verify your email with OTP.",
      userId: user._id,
      isDevMode: emailResult.isDevMode || false,
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

