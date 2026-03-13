# 🔥 RESEND DOMAIN VERIFICATION - STEP-BY-STEP FOR BEGINNERS

## 1. **Why gmail.com Blocked?**
```
Resend = Email ESP (Email Service Provider)
gmail.com = Consumer email (Google controls)
Resend CANNOT verify Gmail domains (SPF/DKIM blocked by Google)
Must use YOUR domain (autohub.com)
```

## 2. **Buy Domain ($10/year)**
```
Namecheap/GoDaddy → autobhub.com → Buy → DNS access
```

## 3. **Verify Domain in Resend (5 min)**
```
resend.com → Dashboard → Domains → + Add Domain
Domain: autobhub.com
Records generated:
TXT: resend._domainkey.autobhub.com = v=DKIM1;...
SPF: v=spf1 include:resend.com ~all
```

## 4. **DNS Records (Copy-Paste)**
```
DNS Provider (Namecheap):
1. TXT | resend._domainkey.autobhub.com | v=DKIM1;p=kjdksl... (from Resend)
2. TXT | _spf.autobhub.com | v=spf1 include:resend.com ~all
3. Wait 5-15 min → Resend "Verified ✓"
```

## 5. **Update Code**
```
.env:
RESEND_API_KEY=re_xxxx
FROM_EMAIL=noreply@autobhub.com

resendEmail.js:
from: process.env.FROM_EMAIL
```

## 6. **Working Node.js Example**
```js
const { Resend } = require('resend');
const resend = new Resend('re_xxxx');

async function sendOTP(email, otp) {
  try {
    await resend.emails.send({
      from: 'noreply@autobhub.com',
      to: [email],
      subject: 'OTP Code',
      html: `<h1>${otp}</h1>`
    });
    console.log('✅ Sent!');
  } catch (error) {
    console.log('❌', error.message);
  }
}

// Test
sendOTP('test@gmail.com', '123456');
```

## 7. **Test After Verification**
```
1. curl -X POST localhost:5000/api/user/register -d '{"email":"test@gmail.com"}'
2. Check test@gmail.com → OTP received ✅
3. Frontend register → OTP works live!
```

**Result:** ANY user email receives OTP! No Gmail limits. 🚀
