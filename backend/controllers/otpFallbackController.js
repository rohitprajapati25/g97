const User = require("../models/User");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.checkOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (user.otpCode) {
      res.json({
        otp: user.otpCode,
        expires: user.otpExpires,
        isDevMode: true
      });
    } else {
      res.status(400).json({ message: "No OTP found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error checking OTP" });
  }
};

// Super Admin bypass for production testing
exports.adminCheckOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const newOTP = generateOTP();
    user.otpCode = newOTP;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    res.json({ otp: newOTP, message: "New OTP generated for testing" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

module.exports = exports;

