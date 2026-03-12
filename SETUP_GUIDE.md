# G97 OTP Authentication Setup Guide

## Problem Identified
The OTP verification system was fully implemented but **email credentials were not configured** in the `.env` file. This caused the OTP emails to fail on the live server.

## Fixes Applied

### 1. Created `.env.example` 
Located at: `backend/.env.example`
Contains all required environment variables with instructions.

### 2. Improved Email Handling
- Added HTML email template with professional design
- Added "Development Mode" fallback that allows testing without email
- Backend now returns `isDevMode: true` when email is not configured
- Frontend displays helpful message when in dev mode

### 3. Better Error Messages
- Frontend now shows clear instructions when in dev mode
- Server console logs OTP for testing purposes

---

## Configuration Required for Production

### Step 1: Configure Environment Variables

Add these to your **live server's** environment variables (not just `.env` file):

```env
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-16-char-app-password
JWT_SECRET=your-secure-random-secret-key
MONGODB_URI=your-mongodb-connection-string
```

### Step 2: Get Gmail App Password

**IMPORTANT:** You cannot use your regular Gmail password. You must create an App Password:

1. **Enable 2-Factor Authentication** on your Google Account
   - Go to: https://myaccount.google.com/signinoptions/two-step-verification
   
2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select App: "Mail"
   - Select Device: "Other (Custom name)" → Enter "G97 Server"
   - Click "Generate"
   
3. **Copy the 16-character password** and use it as `MAIL_PASS`

### Step 3: Set JWT_SECRET

Generate a secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## How It Works Now

### Development Mode (Email Not Configured)
1. User registers
2. OTP is generated and stored in database
3. OTP is logged to **server console**: `[DEV MODE - OTP FOR TESTING] Email: user@example.com, OTP: 123456`
4. Frontend shows: "DEV MODE: Check server console for OTP"
5. User can verify using the OTP from console

### Production Mode (Email Configured)
1. User registers
2. OTP is generated and sent to user's email
3. User enters OTP to verify
4. Account is activated

---

## Testing the OTP System

### Local Testing
```bash
cd backend
npm run dev
# Register a new user
# Check server console for OTP: [DEV MODE - OTP FOR TESTING] Email: ... OTP: ...
# Enter that OTP in the verification page
```

### Production Testing
1. Configure `MAIL_USER` and `MAIL_PASS` on your hosting platform
2. Register a new user
3. Check email inbox (and spam folder) for OTP
4. Verify the account

---

## Troubleshooting

### OTP Not Received?
1. Check server logs for: `[EMAIL ERROR] Email not configured!`
2. Verify `MAIL_USER` and `MAIL_PASS` are set on the server
3. Check spam/junk folder
4. Verify Gmail App Password is correct (16 characters)

### "Invalid OTP" Error?
1. OTP expires after 10 minutes - request a new one
2. Check if user is already verified (`isVerified: true` in database)
3. Check server logs for the correct OTP

### Login Fails After Verification?
1. Make sure `isVerified: true` in the User collection
2. Check that JWT_SECRET is configured
3. Clear browser localStorage and try again

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/register` | Register new user, sends OTP |
| POST | `/api/user/verify-otp` | Verify email with OTP |
| POST | `/api/user/resend-otp` | Request new OTP |
| POST | `/api/user/login` | Login (requires verified email) |

---

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: "user",
  isVerified: Boolean,      // false until OTP verified
  otpCode: String,         // 6-digit OTP
  otpExpires: DateTime,    // expires in 10 minutes
  createdAt: DateTime,
  updatedAt: DateTime
}
```

