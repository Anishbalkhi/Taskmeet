import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

console.log('SENDGRID_API_KEY present:', !!process.env.SENDGRID_API_KEY);
console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL);
console.log('SENDGRID_FROM_NAME:', process.env.SENDGRID_FROM_NAME);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: process.env.SENDGRID_FROM_EMAIL,
  from: {
    email: process.env.SENDGRID_FROM_EMAIL,
    name: process.env.SENDGRID_FROM_NAME || 'MeetTask'
  },
  subject: 'MeetTask Email Service Test - ' + new Date().toISOString(),
  text: 'Email service is working! Sent at: ' + new Date().toLocaleString(),
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px">
      <h2 style="color:#6366f1;margin-top:0">✅ Email Service Working!</h2>
      <p style="color:#374151">The MeetTask SendGrid email service is configured and sending correctly.</p>
      <p style="color:#6b7280;font-size:14px">Tested at: <strong>${new Date().toISOString()}</strong></p>
      <p style="color:#6b7280;font-size:14px">From: <strong>${process.env.SENDGRID_FROM_EMAIL}</strong></p>
    </div>
  `
};

console.log('\nSending test email to:', msg.to);

try {
  const [response] = await sgMail.send(msg);
  console.log('\n✅ SUCCESS!');
  console.log('Status Code:', response.statusCode);
  console.log('Email sent successfully to:', msg.to);
} catch (err) {
  console.error('\n❌ FAILED!');
  if (err.response) {
    console.error('Status:', err.response.status || err.code);
    console.error('Body:', JSON.stringify(err.response.body, null, 2));
  } else {
    console.error('Error:', err.message);
  }
  process.exit(1);
}
