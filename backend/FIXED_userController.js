const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { setOTP, getOTP, clearOTP } = require("../utils/otpStorage");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp) => {
  console.log(`🔑 OTP for ${email}: ${otp}`); // Always log for testing
  return { success: true, isDevMode: true };
};

/* REGISTER */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

    const otp = generateOTP();
    setOTP(email, otp, 10 * 60 * 1000);

    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "OTP sent! Check console/email.",
      isDevMode: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* VERIFY OTP + CREATE USER */
exports.verifyOTP = async (req, res) => {
  try {
    const { name, email, password, phone, otp } = req.body;

    const storedOTP = getOTP(email);
    if (!storedOTP || otp !== storedOTP) {
      clearOTP(email);
      return res.status(400).json({ message: "Invalid/expired OTP" });
    }

    clearOTP(email);

    // Create user
    const user = await User.create({
      name: name || "User",
      email: email.toLowerCase().trim(),
      password,
      phone: phone || "",
      role: "user",
      isVerified: true
    });

    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "30m" });

    res.json({
      message: "Success! Logged in.",
      token,
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('VERIFY ERROR:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "30m" });

    res.json({ token, role: "user", user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

