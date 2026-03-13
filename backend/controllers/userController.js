const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // Industry: Secure OTP hash

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// INDUSTRY STANDARD: Gmail + Rate Limiting + OTP Hash
const sendOTPEmail = async (email, plainOTP) => {
  const hashedOTP = hashOTP(plainOTP);
  console.log(`🔐 SECURE OTP [${email}]: ${plainOTP} → hashed`);

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // App Password
      },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `"AutoHub Security" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "🔐 AutoHub - Secure Verification [OTP]",
      text: `Your AutoHub OTP: ${plainOTP} (expires in 10 min)`,
      html: `
<!DOCTYPE html>
<html>
<head><title>AutoHub OTP</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center;">
    <h1 style="color: #dc2626;">AutoHub Verification</h1>
    <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; background: #dc2626; color: white; padding: 30px; border-radius: 16px; margin: 30px 0; box-shadow: 0 8px 32px rgba(220,38,38,0.3);">
      ${plainOTP}
    </div>
    <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
      Valid for <strong>10 minutes only</strong>. Do not share.
    </p>
    <hr style="border: none; height: 1px; background: #e5e7eb;">
    <p style="color: #9ca3af; font-size: 14px;">
      AutoHub Security Team
    </p>
  </div>
</body>
</html>      
      `
    });

    console.log(`✅ INDUSTRY OTP SENT → ${email}`);
    return { success: true, hashedOTP }; // Return hash for verification
  } catch (error) {
    console.error(`❌ EMAIL FAIL [${email}]:`, error.message);
    return { success: false, error: error.message };
  }
};

// RATE LIMIT: IP + Email (industry security)
const rateLimit = new Map(); // Simple in-memory (Redis production)

const checkRateLimit = (ip, email) => {
  const key = `${ip}:${email}`;
  const now = Date.now();
  const userData = rateLimit.get(key) || { count: 0, reset: now + 15 * 60 * 1000 };
  
  if (now > userData.reset) {
    userData.count = 0;
  }
  
  if (userData.count >= 5) {
    return false;
  }
  
  userData.count += 1;
  rateLimit.set(key, userData);
  return true;
};

/* REGISTER - Industry Secure */
exports.registerUser = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const { name, email, password, phone } = req.body;

  if (!name?.trim() || !email || !password?.length >= 6) {
    return res.status(400).json({ message: "Invalid input" });
  }

  // Rate limit
  if (!checkRateLimit(ip, email)) {
    return res.status(429).json({ message: "Too many attempts. Try in 15 min" });
  }

  try {
    // Cleanup old
    await User.deleteMany({
      email,
      isVerified: false,
      otpExpires: { $lt: new Date(Date.now() - 15 * 60 * 1000) }
    });

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email registered" });
    }

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Auto hashed by model
      phone: phone || "",
      role: "user",
      isVerified: false,
      otpHash: hashedOTP, // Secure: Hash stored
      otpExpires,
      otpAttempts: 0,
      ipAddress: ip,
    });
    await user.save();

    const emailResult = await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "Registration successful",
      userId: user._id,
      emailSent: emailResult.success,
      otpMode: !emailResult.success ? 'console' : 'email'
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* VERIFY - Secure Hash Compare */
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  if (!checkRateLimit(ip, email)) {
    return res.status(429).json({ message: "Rate limited" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || user.isVerified) {
    return res.status(400).json({ message: "Invalid session" });
  }

  if (Date.now() > user.otpExpires.getTime()) {
    await user.deleteOne();
    return res.status(400).json({ message: "OTP expired" });
  }

  if (hashOTP(otp) !== user.otpHash) {
    user.otpAttempts += 1;
    await user.save();

    if (user.otpAttempts >= 3) {
      await user.deleteOne();
      return res.status(400).json({ message: "Max attempts exceeded" });
    }

    return res.status(400).json({ 
      message: `Invalid OTP (${3 - user.otpAttempts} attempts left)` 
    });
  }

  // SUCCESS
  user.isVerified = true;
  user.otpHash = null;
  user.otpExpires = null;
  user.otpAttempts = 0;
  await user.save();

  console.log(`🎉 SECURE VERIFY: ${user.email}`);
  res.json({ message: "Email verified successfully" });
};

/* RESEND */
exports.resendOTP = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const { email } = req.body;

  if (!checkRateLimit(ip, email)) {
    return res.status(429).json({ message: "Rate limited" });
  }

  const user = await User.findOne({ 
    email: email.toLowerCase().trim(),
    isVerified: false,
    otpExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ message: "No pending verification" });
  }

  const otp = generateOTP();
  const hashedOTP = hashOTP(otp);
  user.otpHash = hashedOTP;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save();

  const result = await sendOTPEmail(email, otp);
  res.json({ 
    message: result.success ? "OTP resent" : "Console fallback",
    sent: result.success
  });
};

/* LOGIN */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password');

    if (!user || !user.isVerified || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otpHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Profile error" });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getProfile
};

