import nodemailer from 'nodemailer';

// Pull credentials securely from environment variables with fallbacks
const userEmail = process.env.EMAIL_USER || 'dharmikthakkar2203@gmail.com';
const userPass = process.env.EMAIL_PASS || 'lfkutelywvrpehgx';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // false for port 587 STARTTLS
  auth: {
    user: userEmail,
    pass: userPass
  },
  tls: {
    rejectUnauthorized: false, // bypass SSL cert constraints on hosting providers
    ciphers: 'SSLv3'
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000
});

// Test SMTP connection configuration when server/module initializes
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ NEWSLETTER SMTP TRANSPORTER VERIFICATION FAILED:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
  } else {
    console.log('🚀 NEWSLETTER SMTP TRANSPORTER VERIFIED: Ready to dispatch newsletters.');
  }
});

/**
 * Reusable helper to send emails asynchronously.
 * Supports to, bcc, subject, and HTML content.
 */
export const sendEmail = async ({ to, bcc, subject, html }) => {
  const mailOptions = {
    from: `"Flavors & Fork" <${userEmail}>`,
    to,
    bcc,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email dispatch failed:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw error;
  }
};
