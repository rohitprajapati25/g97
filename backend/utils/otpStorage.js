const otpStorage = new Map();

const setOTP = (email, otp, expires) => {
  otpStorage.set(email, {
    otp,
    expires: Date.now() + expires
  });
};

const getOTP = (email) => {
  const stored = otpStorage.get(email);
  if (!stored || Date.now() > stored.expires) {
    otpStorage.delete(email);
    return null;
  }
  return stored.otp;
};

const clearOTP = (email) => {
  otpStorage.delete(email);
};

module.exports = { setOTP, getOTP, clearOTP };

