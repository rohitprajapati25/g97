# 🔴 RESEND 403 FIX - ANY Gmail OTP (5 Min)

## Problem
```
pr4901958@gmail.com → Works ✓
user@gmail.com → 403 Forbidden ❌
```

## Solution: Verify FREE Domain

### Step 1: Resend Domain (2min)
```
1. resend.com → Dashboard → Domains → + Add Domain
2. Domain Name: resend.dev (FREE - no buy needed)
3. "Verify Domain" → TXT record shown
```

### Step 2: DNS (Namecheap/GoDaddy - 2min)
```
TXT Record:
Name: resend._domainkey.resend.dev
Value: [Copy from Resend]
TTL: 3600
5min wait → VERIFIED ✓
```

### Step 3: Render Env (30sec)
```
Dashboard → Environment:
RESEND_API_KEY=re_xxxxx ✓
FROM_EMAIL=onboarding@resend.dev  ← NEW
MONGODB_URI=your-mongo ✓
```

### Step 4: Deploy
```
git push origin main
Wait 2min → Render ready
```

### Test
```
Frontend → any@gmail.com register
→ any@gmail.com inbox OTP ✓
→ Verify → Login LIVE ✓
```

## Logs Success
```
🔐 TEMP REG [any@gmail.com]: 123456
✅ Resend ID: re_xxxxx
✅ COMPLETE any@gmail.com
```

**Result:** ANY Gmail receives OTP. Done!
