const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp) => {
  console.log(`🔑 OTP for ${email}: ${otp}`);
  
try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: { rejectUnauthorized: false }
    });
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "AutoHub - Your Verification Code",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Your OTP Code: ${otp}</h2>
          <p>Valid for 10 minutes</p>
        </div>
      `
    });
    console.log(`✅ EMAIL SENT to ${email}`);
  } catch (err) {
    console.error(`❌ EMAIL ERROR: ${err.message}`);
    console.log('Use console OTP above 👆');
  }
  return { success: true };
};

/* REGISTER - CLEANUP OLD + ABANDONED */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

    // Delete abandoned/old unverified users (user left without OTP)
    await User.deleteMany({
      email,
      isVerified: false,
      otpExpires: { $lt: new Date(Date.now() - 15 * 60 * 1000) } // 15 minutes timeout
    });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // Create user with OTP
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      role: "user",
      isVerified: false,
      otpCode: otp,
      otpExpires,
      otpAttempts: 0,
    });

    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "Registration successful. Please verify your email with OTP.",
      userId: user._id,
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* VERIFY OTP - 3 ATTEMPTS */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    if (Date.now() > user.otpExpires) {
      await user.deleteOne();
      return res.status(400).json({ message: "OTP expired. Please register again." });
    }

    if (user.otpCode !== otp) {
      user.otpAttempts += 1;
      await user.save();

      if (user.otpAttempts >= 3) {
        await user.deleteOne();
        return res.status(400).json({ message: "3 failed attempts. Please register again." });
      }

      return res.status(400).json({ 
        message: `Invalid OTP. ${3 - user.otpAttempts} attempts left` 
      });
    }

    // SUCCESS - Keep data forever
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: "Verified! You can login now." });
  } catch (err) {
    console.error('VERIFY ERROR:', err);
    res.status(500).json({ message: "Verification failed" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });

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

