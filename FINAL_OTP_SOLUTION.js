const { Resend } = require('resend');
const User = require('../models/User');

// ✅ 100% WORKING ON RENDER - RESEND
const resend = new Resend(process.env.RESEND_API
