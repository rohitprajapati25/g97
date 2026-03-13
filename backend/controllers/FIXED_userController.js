const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// const { sendOTP } = require("./resendEmail"); // COMMENTED - Gmail Direct

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp) => {
  console.log(`🔑 LIVE OTP for ${email}: ${otp}`);

  // 🔥 INDUSTRY STANDARD: Gmail SMTP (Free, ANY recipient, Live ready)
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Your 16-char App Password
      },
      tls: { rejectUnauthorized: false }
    });
    
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "🔴 AutoHub - Verify Your Email (OTP)",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; text-align: center; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <h1 style="color: #dc2626; margin-bottom: 20px;">🛞 AutoHub Verification</h1>
          <div style="font-size: 52px; font-weight: bold; letter-spacing: 15px; background: linear-gradient(45deg, #dc2626, #ef4444); color: white; padding: 25px 20px; border-radius: 25px; margin: 30px auto; width: fit-content; box-shadow: 0 15px 35px rgba(220,38,38,0.4);">
            ${otp}
          </div>
          <p style="color: #374151; font-size: 18px; margin-bottom: 10px;">
            Your verification code is valid for <strong>10 minutes</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Enter this code in the app to complete registration.
          </p>
        </div>
      `
    });
    
    console.log(`✅ GMAIL LIVE SENT → ${email}: ${otp}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ GMAIL FAILED [${email}]:`, error.message);
    console.log('🔧 FIX: Check MAIL_USER/MAIL_PASS in .env (App Password needed)');
    return { success: false, error: error.message };
  }
};

/* RESEND OTP */
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ 
      email, 
      isVerified: false,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "No pending verification. Register again." });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    user.otpCode = otp;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0;
    await user.save();

    const result = await sendOTPEmail(email, otp);
    res.json({ 
      message: result.success ? "New OTP sent to email!" : "Check server console (email config needed)",
      isDevMode: !result.success
    });
  } catch (err) {
    console.error("Resend Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* REGISTER */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

    // Cleanup abandoned registrations
    await User.deleteMany({
      email,
      isVerified: false,
      otpExpires: { $lt: new Date(Date.now() - 15 * 60 * 1000) }
    });

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

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

    const emailResult = await sendOTPEmail(email, otp);

    res.status(201).json({
      message: emailResult.success ? "✅ Registered! Check email for OTP." : "✅ Registered (check server console for OTP)",
      userId: user._id,
      isDevMode: !emailResult.success
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* VERIFY OTP */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    if (Date.now() > user.otpExpires) {
      await user.deleteOne();
      return res.status(400).json({ message: "OTP expired. Register again." });
    }

    if (user.otpCode !== otp) {
      user.otpAttempts += 1;
      await user.save();

      if (user.otpAttempts >= 3) {
        await user.deleteOne();
        return res.status(400).json({ message: "3 failed attempts. Register again." });
      }

      return res.status(400).json({ 
        message: `Wrong OTP. ${3 - user.otpAttempts} attempts left` 
      });
    }

    // SUCCESS
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    console.log(`🎉 VERIFIED: ${user.email}`);
    res.json({ message: "✅ Email verified! Login now." });
  } catch (err) {
    console.error('Verify Error:', err);
    res.status(500).json({ message: "Verification failed" });
  }
};

/* LOGIN */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) return res.status(400).json({ message: "Please verify email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({ token, role: "user", user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};

