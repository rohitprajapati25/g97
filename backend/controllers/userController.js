const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require('resend'); // LIVE RESEND

const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const hashOTP = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

// RESEND + Industry Security
const sendOTPEmail = async (email, plainOTP) => {
  const hashedOTP = hashOTP(plainOTP);
  console.log(`🔐 RESEND OTP [${email}]: ${plainOTP} → ${hashedOTP.slice(0,16)}...`);

  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: [email],
      subject: "🔐 AutoHub - OTP Verification",
      html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; max-width: 500px; margin: 0 auto; padding: 40px;">
  <h1 style="color: #dc2626;">AutoHub OTP</h1>
  <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; background: #dc2626; color: white; padding: 30px; border-radius: 16px; text-align: center;">
    ${plainOTP}
  </div>
  <p style="color: #666; margin-top: 20px;">Valid 10 minutes. Don't share.</p>
</body>
</html>`,
    });

    console.log(`✅ RESEND LIVE → ${email} ID: ${data.id}`);
    return { success: true, hashedOTP };
  } catch (error) {
    console.error(`❌ RESEND ERROR [${email}]:`, error.message);
    return { success: false, error: error.message };
  }
};

// Rate Limiting
const rateLimit = new Map();
const checkRateLimit = (ip, email) => {
  const key = `${ip}:${email}`;
  const now = Date.now();
  const data = rateLimit.get(key) || { count: 0, reset: now + 15*60*1000 };
  if (now > data.reset) data.count = 0;
  if (data.count >= 3) return false;
  data.count += 1;
  rateLimit.set(key, data);
  return true;
};

/* REGISTER */
exports.registerUser = async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const { name, email, password } = req.body;

  // Input validation
  if (!name?.trim() || !email || password.length < 6) {
    return res.status(400).json({ message: "Invalid input" });
  }

  // Rate limit
  if (!checkRateLimit(ip, email)) {
    return res.status(429).json({ message: "Too many requests" });
  }

  try {
    // Cleanup old
    await User.deleteMany({
      email: email.toLowerCase(),
      isVerified: false,
      otpExpires: { $lt: new Date(Date.now() - 15*60*1000) }
    });

    // Exists check
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpires = Date.now() + 10*60*1000;

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      isVerified: false,
      otpHash: hashedOTP,
      otpExpires: new Date(otpExpires),
      otpAttempts: 0,
      ipAddress: ip
    });
    await user.save();

    const result = await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "Registration successful",
      userId: user._id,
      emailSent: result.success,
      isDevMode: !result.success
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* VERIFY */
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  if (!checkRateLimit(ip, email)) {
    return res.status(429).json({ message: "Rate limited" });
  }

  try {
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isVerified: false 
    });

    if (!user) {
      return res.status(400).json({ message: "No registration found" });
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
        return res.status(400).json({ message: "Too many attempts" });
      }

      return res.status(400).json({ message: `${3-user.otpAttempts} attempts left` });
    }

    // Verified
    user.isVerified = true;
    user.otpHash = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: "Verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};

/* RESEND */
exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  if (!checkRateLimit(ip, email)) {
    return res.status(429).json({ message: "Rate limited" });
  }

  try {
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isVerified: false,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "No pending OTP" });
  }

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    user.otpHash = hashedOTP;
    user.otpExpires = new Date(Date.now() + 10*60*1000);
    user.otpAttempts = 0;
    await user.save();

    const result = await sendOTPEmail(email, otp);
    res.json({ message: "OTP resent", success: result.success });
  } catch (error) {
    res.status(500).json({ message: "Resend failed" });
  }
};

/* LOGIN */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !user.isVerified || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getProfile
};

