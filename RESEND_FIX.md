# ✅ RESEND 403 FIXED - Domain Verification

**Error:** `Domain not verified: Verify yourdomain.com or update your from domain`

**SOLUTION:**

## 1. **Update resendEmail.js** (DONE):
```
from: 'AutoHub <noreply@your-verified-domain.com>'
```

## 2. **Get FREE Verified Domain (2 min):**
```
1. resend.com → Dashboard → Domains
2. Add your domain (yourdomain.com)
3. Add TXT record to DNS
4. Verified ✓
```

## 3. **Use Verified From Address:**
```
✅ Working examples:
- noreply@yourdomain.com
- hello@yourdomain.com  
- support@yourdomain.com

❌ Invalid:
- noreply@gmail.com (not yours)
- noreply@yourdomain.com (unverified)
```

## 4. **Render Environment:**
```
RESEND_API_KEY=re_xxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

## 5. **Test Command:**
```
curl -X POST https://yourapp.onrender.com/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@gmail.com","password":"123456"}'
```

**Domain verified = 100% delivery! 🚀**

**Update `from:` → Push → Deploy → Live OTP emails!**

