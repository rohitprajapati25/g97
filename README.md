# G97 AutoHub - OTP Authentication Setup

## 🚀 Quick Start

```bash
# 1. Backend
cd backend
copy sample.env .env
npm install
nodemon server.js

# 2. Frontend
cd frontend/admin
npm install
npm run dev

# 3. Test OTP
http://localhost:5173/admin/user/register
→ Console में OTP दिखेगा: "🔑 OTP: 123456"
→ OTP enter करें → Login success ✓
```

## 📧 Gmail OTP Setup (Production)
```
1. Gmail → Google Account → Security → 2-Step ON
2. App Passwords → "Mail" → Generate 16-char password
3. .env में:
   MAIL_USER=your@gmail.com
   MAIL_PASS=xxxx xxxx xxxx xxxx
```

## ✅ Working Status: 100% LOCAL READY!
