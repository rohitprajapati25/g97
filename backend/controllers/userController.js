const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Resend } = require('resend');
const crypto = require('crypto');

const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Rate limit map: {email: {count, resetTime}}
const rateLimit = new Map();

const checkRateLimit = (email) => {
  const now = Date.now();
  const data = rateLimit.get(email) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (now > data.reset) data.count = 0;
  if (data.count >= 5) return false;
  data.count += 1;
  rateLimit.set(email, data);
  return true;
};

const sendProfessionalOTP = async (email, otp) => {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [email],
      subject: `Your ${process.env.CLIENT_URL ? new URL(process.env.CLIENT_URL).hostname : 'AutoHub'} Verification Code`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f8fafc;">
    <table role="presentation" width="100%" style="border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 0 0 30px 0;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1e293b;">Complete Your Registration</h1>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0 0 30px 0;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 36px; font-weight: 700; letter-spacing: 8px; padding: 30px 40px; border-radius: 16px; box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3); min-width: 200px;">
            ${otp}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6; text-align: center;">
          This code will expire in 5 minutes.<br>
          Enter it in the app to verify your email.
        </td>
      </tr>
      <tr>
        <td style="padding: 30px 0 0 0;">
          <p style="margin: 0 0 10px 0; color: #475569; font-size: 14px;">
            Need help? Reply to this email or visit our support page.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`
    });
    console.log(`✅ RESEND PRO EMAIL → ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ RESEND ERROR [${email}]:`, error.message);
    return false;
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Invalid input - password min 6 chars' });
    }

    if (!checkRateLimit(email.toLowerCase().trim())) {
      return res.status(429).json({ message: 'Too many requests. Try again later.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    await User.deleteMany({
      email: email.toLowerCase().trim(),
      isVerified: false,
      otpExpires: { $lt: new Date(Date.now() - 5 * 60 * 1000) }
    });

    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      otp,
      otpExpires: new Date(otpExpires),
      otpAttempts: 0,
      isVerified: false
    });
    await user.save();

    const emailSent = await sendProfessionalOTP(user.email, otp);
    
    res.status(201).json({
      message: emailSent ? 'OTP sent to your email' : 'OTP generated - check console (Resend pending)',
      userId: user._id
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      isVerified: false
    });

    if (!user) {
      return res.status(400).json({ message: 'No pending registration' });
    }

    if (Date.now() > user.otpExpires.getTime()) {
      return res.status(400).json({ message: 'OTP expired - register again' });
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      if (user.otpAttempts >= 3) {
        await user.deleteOne();
        return res.status(400).json({ message: 'Max attempts exceeded. Register again.' });
      }
      return res.status(400).json({ message: `Invalid OTP. ${3 - user.otpAttempts} attempts left` });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ VERIFIED: ${user.email}`);
    res.json({ 
      message: 'Verified successfully! You can login.',
      token,
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!checkRateLimit(email.toLowerCase().trim())) {
      return res.status(429).json({ message: 'Too many resend requests' });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      isVerified: false,
      otpExpires: { $gt: new Date(Date.now() + 60 * 1000) }
    });

    if (!user) {
      return res.status(400).json({ message: 'No active OTP. Register again.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();

    const emailSent = await sendProfessionalOTP(user.email, otp);

    res.json({ 
      message: emailSent ? 'New OTP sent!' : 'New OTP ready (check console)',
      retryAfter: 60
    });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ message: 'Resend failed' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user || !await bcrypt.compare(password, user.password) || !user.isVerified) {
      return res.status(401).json({ message: 'Invalid credentials or unverified' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Login error' });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

module.exports = { registerUser, verifyOTP, resendOTP, loginUser, getProfile };
