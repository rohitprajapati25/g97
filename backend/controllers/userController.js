const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Rate limit map
const rateLimit = new Map();

const checkRateLimit = (email) => {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const data = rateLimit.get(key) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (now > data.reset) data.count = 0;
  if (data.count >= 5) return false;
  data.count += 1;
  rateLimit.set(key, data);
  return true;
};

const sendProfessionalOTP = async (email, otp) => {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@autohub.com',
      to: [email],
      subject: 'Your AutoHub Verification Code',
      html: `<html><body><h1>Complete Registration</h1><div style="font-size:48px;font-weight:bold;letter-spacing:10px;background:linear-gradient(45deg,#dc2626,#ef4444);color:white;padding:30px;border-radius:20px;text-align:center;">${otp}</div><p>Expires in 5 minutes.</p></body></html>`
    });
    console.log(`✅ RESEND SENT to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ RESEND FAIL ${email}:`, error.message);
    return false;
  }
};

// Register - Spec compliant
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Invalid data' });
    if (!checkRateLimit(email)) return res.status(429).json({ message: 'Rate limit' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'Email exists' });

    await User.deleteMany({ email: email.toLowerCase().trim(), isVerified: false, otpExpires: { $lt: new Date(Date.now() - 5*60*1000) } });

    const otp = generateOTP();
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      otp,
      otpExpires: new Date(Date.now() + 5*60*1000),
      isVerified: false
    });
    await user.save();

    await sendProfessionalOTP(user.email, otp);

    res.json({ message: 'OTP sent', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim(), isVerified: false });
    if (!user) return res.status(400).json({ message: 'Invalid session' });

    if (Date.now() > user.otpExpires) return res.status(400).json({ message: 'Expired' });

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP', attempts: user.otpAttempts });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!checkRateLimit(email)) return res.status(429).json({ message: 'Rate limit' });

    const user = await User.findOne({ email: email.toLowerCase().trim(), isVerified: false, otpExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'No session' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5*60*1000);
    await user.save();

    await sendProfessionalOTP(user.email, otp);
    res.json({ message: 'Resent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !await bcrypt.compare(password, user.password) || !user.isVerified) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Profile
const getProfile = async (req, res) => {
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
