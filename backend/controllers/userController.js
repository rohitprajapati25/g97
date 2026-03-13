const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

// TEMP USER - Delete after 15min if not verified
const TempUser = require("../models/TempUser"); 

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

exports.registerUser = async (req, res) => {
  const ip = req.ip || 'unknown';
  const { name, email, password, phone } = req.body;

  // STRICT VALIDATION
  if (!name?.trim() || name.length < 2 || !email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  if (!checkRateLimit(ip, email)) {
    return res.status(429).json({ message: 'Too many attempts' });
  }

  try {
    // 1. EMAIL VERIFICATION FIRST - NO DATA YET
    const otp = generateOTP();
    
    const emailSent = await sendOTPEmail(email.toLowerCase().trim(), otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Email service unavailable' });
    }

    // 2. OTP SENT ✓ - Create TEMP user (delete if not verified)
    const tempUser = new TempUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will hash
      phone: phone || '',
      otpCode: otp,
      otpExpires: new Date(Date.now() + 10*60*1000),
      ipAddress: ip
    });
    await tempUser.save();

    console.log(`📧 TEMP USER CREATED ${email} - Verify in 10min or DELETE`);
    
    res.status(201).json({
      message: 'Check email for OTP to complete registration',
      tempId: tempUser._id,
      isDevMode: false
    });
  } catch (error) {
    console.error('Temp reg error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // 1. Find TEMP user
    const tempUser = await TempUser.findOne({ 
      email: email.toLowerCase().trim(),
      otpCode: otp,
      otpExpires: { $gt: new Date() }
    });

    if (!tempUser) {
      return res.status(400).json({ message: 'Invalid/expired OTP' });
    }

    // 2. ALL GOOD - Create PERMANENT User
    const user = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password, // Auto hash
      phone: tempUser.phone,
      role: 'user',
      isVerified: true, // Verified already!
      ipAddress: tempUser.ipAddress
    });
    await user.save();

    // 3. Delete TEMP
    await TempUser.deleteOne({ _id: tempUser._id });

    console.log(`✅ REG COMPLETE → PERMANENT ${user.email}`);
    
    res.json({ message: 'Registration complete! You can login now' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};

exports.resendOTP = async (req, res) => {
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

exports.loginUser = async (req, res) => {
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

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

module.exports = {
  registerUser: registerUser,
  verifyOTP: verifyOTP,
  resendOTP: resendOTP,
  loginUser: loginUser,
  getProfile: getProfile
};

