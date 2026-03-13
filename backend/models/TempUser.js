const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tempUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  otpCode: { type: String, required: true },
  otpExpires: { type: Date, required: true },
  ipAddress: String
}, { timestamps: true, expires: '15m' }); // AUTO DELETE after 15min

tempUserSchema.pre('save', async function() {
  if (this.isModified('password')) {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }
});

module.exports = mongoose.model('TempUser', tempUserSchema);

