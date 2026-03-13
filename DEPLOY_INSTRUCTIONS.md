# 🚀 INDUSTRY OTP LIVE DEPLOY - 2 MINUTES

## 1. Local Test
```
copy backend\\controllers\\FIXED_userController.js backend\\controllers\\userController.js
cd backend
npm start
```

Test:
```
powershell "Invoke-RestMethod -Uri http://localhost:5000/api/user/register -Method Post -ContentType application/json -Body '{\"name\":\"Test\",\"email\":\"test@gmail.com\",\"password\":\"123456\"}'"
```
Check console + test@gmail.com → OTP ✓

## 2. Render Deploy
```
git add .
git commit -m "industry secure OTP gmail live"
git push origin main
```

## 3. Render Dashboard Env Vars
```
MAIL_USER=pr4901958@gmail.com
MAIL_PASS=your-16-char-app-password
MONGODB_URI=mongodb+srv://...
JWT_SECRET=g97-industry-2024
NODE_ENV=production
```

## Expected Logs
```
MongoDB Connected
🔐 SECURE OTP [user@gmail.com]: 123456 → hashed
✅ INDUSTRY OTP SENT → user@gmail.com
```

## Frontend Test
1. https://g97.vercel.app/user/register
2. any@gmail.com → OTP in inbox
3. Verify → Login LIVE!

**DONE! User Gmail OTP working production.**
