const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTP = async (email, otp) => {
  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'pr4901958@gmail.com', // Use env var or your verified email
      to: [email],
      subject: 'Your AutoHub OTP Code',
      html: `
        <h2>🛞 AutoHub Verification</h2>
        <div style="font-size: 48px; font-weight: bold; letter-spacing: 20px; text-align: center; background: #f3f4f6; padding: 20px; border-radius: 10px;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
      `,
    });

    console.log(`✅ RESEND: OTP sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ RESEND ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
};

