const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Email transporter setup
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const isEmailConfigured = () => {
  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;
  return mailUser && mailPass && mailPass.length > 10;
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp) => {
  if (!isEmailConfigured()) {
    console.log(`🔑 DEV OTP for ${email}: ${otp}`);
    return { success: true, isDevMode: true };
  }
  
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Your G97 Verification Code",
      text: `Your OTP: ${otp}. Expires in 10 minutes.`,
    });
    return { success: true };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false };
  }
};

/* REGISTER - Generate OTP only */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if user exists with OTP (temp registration)
    let tempUser = await User.findOne({ 
      email, 
      isVerified: false,
      otpExpires: { $gt: Date.now() }
    });

    if (!tempUser) {
      // Create new temp user
      const otp = generateOTP();
      const otpExpires = Date.now() + 10 * 60 * 1000;
      
      tempUser = await User.create({
        name,
        email,
        password,
        phone: phone || "",
        role: "user",
        isVerified: false,
        otpCode: otp,
        otpExpires
      });
    }

    const emailResult = await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "OTP sent! Check your email.",
      tempId: tempUser._id,
      isDevMode: emailResult.isDevMode
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

/* VERIFY OTP - Create real user */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const tempUser = await User.findOne({ email });
    if (!tempUser) {
      return res.status(400).json({ message: "No registration found" });
    }

    if (tempUser.isVerified) {
      return res.status(400).json({ message: "Already verified" });
    }

    if (tempUser.otpCode !== otp) {
      // DELETE invalid temp user
      await User.deleteOne({ _id: tempUser._id });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > tempUser.otpExpires) {
      // DELETE expired temp user
      await User.deleteOne({ _id: tempUser._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    // MARK AS VERIFIED - Real user now!
    tempUser.isVerified = true;
    tempUser.otpCode = null;
    tempUser.otpExpires = null;
    await tempUser.save();

    // Generate token
    const token = jwt.sign(
      { id: tempUser._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({
      message: "Registration complete!",
      token,
      user: {
        name: tempUser.name,
        email: tempUser.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Please register first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({
      token,
      role: "user",
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otpCode -otpExpires');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

