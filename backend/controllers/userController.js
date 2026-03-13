const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { sendOTP } = require("./resendEmail");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp) => {
  console.log(`🔑 OTP for ${email}: ${otp}`);
  
  // Try Resend first
  const resendResult = await sendOTP(email, otp);
  if (resendResult.success) {
    console.log(`✅ RESEND sent to ${email}`);
    return resendResult;
  }
  
  // Gmail fallback
  console.log('🔄 RESEND failed, using Gmail fallback');
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
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
        <div style="font-family: Arial; padding: 20px; text-align: center;">
          <h2 style="color: #dc2626;">🛞 Your OTP Code</h2>
          <div style="font-size: 48px; font-weight: bold; letter-spacing: 20px; background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280;">Valid for 10 minutes</p>
        </div>
      `
    });
    console.log(`✅ GMAIL SENT to ${email}`);
    return { success: true };
  } catch (gmailErr) {
    console.error(`❌ GMAIL ERROR: ${gmailErr.message}`);
    return { success: false, error: 'Email failed - check MAIL_USER/MAIL_PASS' };
  }
};

/* RESEND OTP - For users who need new code */
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ 
      email, 
      isVerified: false,
      otpExpires: { $gt: Date.now() } // Must have valid OTP window
    });

    if (!user) {
      return res.status(400).json({ message: "No pending verification found for this email. Please register again." });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    user.otpCode = otp;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0; // Reset attempts on resend
    await user.save();

    await sendOTPEmail(email, otp);

    console.log(`✅ RESEND: New OTP sent to ${email}`);
    res.json({ message: "New OTP sent! Check your email." });
  } catch (err) {
    console.error("Resend Error:", err);
    res.status(500).json({ message: "Resend failed" });
  }
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

