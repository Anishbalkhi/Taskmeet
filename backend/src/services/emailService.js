import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) console.error('Missing SENDGRID_API_KEY');
if (!process.env.SENDGRID_FROM_EMAIL) console.error('Missing SENDGRID_FROM_EMAIL');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL,
  name: process.env.SENDGRID_FROM_NAME || 'MeetTask',
};

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const sendVerificationEmail = async (toEmail, token) => {
  const url = `${frontendUrl}/verify-email?token=${token}`;

  await sgMail.send({
    to: toEmail,
    from: FROM,
    subject: 'Verify your MeetTask account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">Welcome to MeetTask!</h2>
        <p style="color: #555;">Please verify your email address to get started.</p>
        <a href="${url}"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #999; font-size: 14px;">This link expires in 24 hours.</p>
        <p style="color: #999; font-size: 14px;">If you didn't create this account, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 24px;" />
        <p style="color: #ccc; font-size: 12px;">MeetTask &mdash; Meeting &amp; Task Management</p>
      </div>
    `,
    text: `Welcome to MeetTask!\n\nVerify your email: ${url}\n\nThis link expires in 24 hours.`,
  });
};

export const sendPasswordResetEmail = async (toEmail, token) => {
  const url = `${frontendUrl}/reset-password?token=${token}`;

  await sgMail.send({
    to: toEmail,
    from: FROM,
    subject: 'Reset your MeetTask password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">Reset Your Password</h2>
        <p style="color: #555;">You requested a password reset. Click below to set a new password.</p>
        <a href="${url}"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 14px;">This link expires in 1 hour.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 24px;" />
        <p style="color: #ccc; font-size: 12px;">MeetTask &mdash; Meeting &amp; Task Management</p>
      </div>
    `,
    text: `Reset your MeetTask password: ${url}\n\nThis link expires in 1 hour.`,
  });
};

export const sendWorkspaceInviteEmail = async (toEmail, toName, inviterName, workspaceName, role) => {
  const roleLabel = role === 'manager' ? 'Manager' : role === 'admin' ? 'Admin' : 'Member';
  const loginUrl = `${frontendUrl}/login`;

  await sgMail.send({
    to: toEmail,
    from: FROM,
    subject: `You've been invited to join "${workspaceName}" on MeetTask`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">You're invited!</h2>
        <p style="color: #555;">
          <strong>${inviterName}</strong> added you to
          <strong>"${workspaceName}"</strong> on MeetTask as a <strong>${roleLabel}</strong>.
        </p>
        <a href="${loginUrl}"
           style="display: inline-block; background: #1a1a1a; color: white; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Open MeetTask
        </a>
        <p style="color: #999; font-size: 14px;">Log in with this email address to access the workspace.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 24px;" />
        <p style="color: #ccc; font-size: 12px;">MeetTask &mdash; Meeting &amp; Task Management</p>
      </div>
    `,
    text: `${inviterName} invited you to "${workspaceName}" on MeetTask as ${roleLabel}. Log in at: ${loginUrl}`,
  });
};
