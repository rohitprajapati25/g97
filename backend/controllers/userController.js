const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require('resend');
const TempUser = require("../models/TempUser");

const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

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

const sendOTPEmail = async (email, plainOTP) => {
  console.log(`🔐 TEMP REG [${email}]: ${plainOTP}`);
  
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'AutoHub <noreply@resend.dev>',
      to: [email],
      subject: 'AutoHub - Complete Registration [OTP]',
      html: `<h1 style="font-size: 60px; text-align: center;">${plainOTP}</h1>`
    });
    return true;
  } catch (error) {
    console.error(`❌ RESEND [${email}]:`, error.message);
    return false;
  }
};

const registerUser = async (req, res) => {
  const ip = req.ip || 'unknown';
  const { name, email, password, phone } = req.body;

  if (!name?.trim() || name.length < 2 || !email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  if (!checkRateLimit(ip, email)) {
    return res.status(429).json({ message: 'Too many attempts' });
  }

  try {
    const otp = generateOTP();
    
    const emailSent = await sendOTPEmail(email.toLowerCase().trim(), otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Email service unavailable' });
    }

    const tempUser = new TempUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      otpCode: otp,
      otpExpires: new Date(Date.now() + 10*60*1000),
      ipAddress: ip
    });
    await tempUser.save();

    console.log(`📧 TEMP USER CREATED ${email}`);
    
    res.status(201).json({
      message: 'Check email for OTP',
      tempId: tempUser._id
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempUser = await TempUser.findOne({ 
      email: email.toLowerCase().trim(),
      otpCode: otp,
      otpExpires: { $gt: new Date() }
    });

    if (!tempUser) {
      return res.status(400).json({ message: 'Invalid/expired OTP' });
    }

    const user = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      phone: tempUser.phone,
      role: 'user',
      isVerified: true
    });
    await user.save();

    await TempUser.deleteOne({ _id: tempUser._id });

    console.log(`✅ COMPLETE ${user.email}`);
    
    res.json({ message: 'Registration complete!' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  
  try {
    const tempUser = await TempUser.findOne({ 
      email: email.toLowerCase().trim(),
      otpExpires: { $gt: new Date() }
    });

    if (!tempUser) {
      return res.status(400).json({ message: 'No pending registration' });
    }

    const newOtp = generateOTP();
    tempUser.otpCode = newOtp;
    tempUser.otpExpires = new Date(Date.now() + 10*60*1000);
    await tempUser.save();

    await sendOTPEmail(email, newOtp);
    res.json({ message: 'New OTP sent' });
  } catch (error) {
    res.status(500).json({ message: 'Resend failed' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Login error' });
  }
};

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

