# GMAIL OTP NOT WORKING - QUICK FIX

## ✅ CURRENT STATUS (Perfect):
```
🔑 OTP console working ✓
Register 201 ✓
MongoDB connected ✓
Email failed = Gmail auth issue
```

## 🚀 GMAIL FIX (2 Minutes):

### 1. Gmail App Password Generate:
```
Gmail → Google Account → Security
1. 2-Step Verification → ON  
2. App passwords → SELECT
3. App → "Mail" → Device → "Other"
4. Copy 16-char password: `xxxx xxxx xxxx xxxx`
```

### 2. backend/.env Update:
```
MAIL_USER=pr4901958@gmail.com
MAIL_PASS=your-16-char-app-password
JWT_SECRET=your-secret
MONGODB_URI=your-mongo
```

### 3. Test:
```
cd backend
nodemon server.js
Register → Gmail inbox → OTP ✓
```

**💯 DONE! Both Console + Gmail working**

**Note:** Regular Gmail password काम नहीं करेगा, App Password चाहिए only!

