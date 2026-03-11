const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function isEmailConfigured() {
  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;
  return mailUser && mailPass && mailPass.length > 15 && !mailPass.includes('your-');
}

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role: "user" });

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = code;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Send OTP email
    if (isEmailConfigured()) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: email,
          subject: "Your AutoHub Verification OTP",
          text: `Your verification code is: ${code}. Valid for 5 minutes.`,
        });
      } catch (e) { console.error("OTP email failed:", e.message); }
    } else {
      console.log(`[DEV] OTP for ${email}: ${code}`);
    }

    res.status(201).json({ message: "User registered. OTP sent.", requiresOTP: true, email });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

exports.verifyUserOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, role: "user", user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server error" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      // Send OTP for unverified
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpCode = code;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();

      if (isEmailConfigured()) {
        try {
          await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: "Your Login OTP",
            text: `Your login code is ${code}. Valid for 5 minutes.`,
          });
        } catch (e) { console.error("OTP failed:", e.message); }
      } else {
        console.log(`[DEV] Login OTP for ${email}: ${code}`);
      }

      return res.json({ requiresOTP: true, message: "OTP sent", email });
    }

    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, role: "user", user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
