// G-Tech branded email templates for Resend

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>G-Tech</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background-color:#FAFAF8;font-family:'Outfit',Arial,sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FAFAF8;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);border:1px solid #E5E7EB;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #111827 0%, #1F2937 100%);padding:48px 40px;text-align:center;">
              <h1 style="margin:0;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                G-<span style="color:#D4A843;">Tech</span>
              </h1>
              <p style="margin:12px 0 0;font-size:13px;color:rgba(255,255,255,0.6);letter-spacing:2px;text-transform:uppercase;font-weight:500;">
                B-Flex Registration Portal
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:48px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;background-color:#F9FAFB;border-top:1px solid #E5E7EB;">
              <p style="margin:0 0 12px;font-size:13px;color:#6B7280;text-align:center;font-weight:500;">
                © ${new Date().getFullYear()} G-Tech Gambia. All rights reserved.
              </p>
              <p style="margin:0;font-size:13px;color:#6B7280;text-align:center;">
                Questions? Email us at <a href="mailto:gtech@connekt.gm" style="color:#D4A843;text-decoration:none;font-weight:600;">gtech@connekt.gm</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export function verificationEmail(name: string, code: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111827;">
      Welcome to B-Flex, ${name}! 🎉
    </h2>
    <p style="margin:0 0 32px;font-size:16px;color:#4B5563;line-height:1.6;">
      Thank you for creating your account. To complete your registration, please enter the verification code below:
    </p>
    <div style="background:linear-gradient(135deg, #111827 0%, #1F2937 100%);border-radius:16px;padding:28px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:2px;">Your Verification Code</p>
      <p style="margin:0;font-family:monospace;font-size:36px;font-weight:700;color:#D4A843;letter-spacing:8px;">${code}</p>
    </div>
    <p style="margin:0 0 8px;font-size:14px;color:#6B7280;">
      This code expires in <strong style="color:#111827;">15 minutes</strong>.
    </p>
    <p style="margin:0;font-size:14px;color:#6B7280;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  `);
}

export function applicationSubmittedEmail(name: string, programName: string): string {
  return baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
      Application Received! ✅
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#4B5563;line-height:1.6;">
      Hi ${name}, thank you for applying to <strong style="color:#111827;">${programName}</strong>. We've successfully received your application.
    </p>
    <div style="background:#FFFBF0;border-radius:12px;padding:20px;margin:0 0 24px;border-left:4px solid #D4A843;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#111827;text-transform:uppercase;letter-spacing:0.5px;">What's Next?</p>
      <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;color:#4B5563;line-height:1.8;">
        <li>Our team will carefully review your application</li>
        <li>You'll receive an email once a decision has been made</li>
        <li>You can track your application status in your portal</li>
      </ul>
    </div>
    <p style="margin:0;font-size:14px;color:#6B7280;">
      If you have any questions, feel free to reach out to us at <a href="mailto:gtech@connekt.gm" style="color:#D4A843;">gtech@connekt.gm</a>.
    </p>
  `);
}

export function applicationAcceptedEmail(name: string, programName: string, reason?: string): string {
  const reasonBlock = reason
    ? `<div style="background:#F0FDF4;border-radius:12px;padding:20px;margin:0 0 24px;border-left:4px solid #16A34A;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#16A34A;text-transform:uppercase;letter-spacing:0.5px;">Note from our team</p>
        <p style="margin:8px 0 0;font-size:14px;color:#4B5563;line-height:1.6;">${reason}</p>
      </div>`
    : '';

  return baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
      Congratulations, ${name}! 🎊
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#4B5563;line-height:1.6;">
      We're thrilled to let you know that your application to <strong style="color:#111827;">${programName}</strong> has been <span style="color:#16A34A;font-weight:600;">accepted</span>!
    </p>
    ${reasonBlock}
    <div style="background:linear-gradient(135deg, #111827 0%, #1F2937 100%);border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.8);">You're officially in! 🚀</p>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.7);">
        Log in to your portal for more details and next steps.
      </p>
    </div>
    <p style="margin:0;font-size:14px;color:#6B7280;">
      If you have any questions, reach out to us at <a href="mailto:gtech@connekt.gm" style="color:#D4A843;">gtech@connekt.gm</a>.
    </p>
  `);
}

export function applicationRejectedEmail(name: string, programName: string, reason?: string): string {
  const reasonBlock = reason
    ? `<div style="background:#FEF5F0;border-radius:12px;padding:20px;margin:0 0 24px;border-left:4px solid #D97706;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#D97706;text-transform:uppercase;letter-spacing:0.5px;">Feedback from our team</p>
        <p style="margin:8px 0 0;font-size:14px;color:#4B5563;line-height:1.6;">${reason}</p>
      </div>`
    : `<div style="background:#FFFBF0;border-radius:12px;padding:20px;margin:0 0 24px;border-left:4px solid #D4A843;">
        <p style="margin:8px 0 0;font-size:14px;color:#4B5563;line-height:1.6;">
          Due to the high volume of applications we received, we are unfortunately unable to provide individual feedback at this time. We encourage you to apply again for future programs.
        </p>
      </div>`;

  return baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
      Application Update
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:#4B5563;line-height:1.6;">
      Hi ${name}, thank you for your interest in <strong style="color:#111827;">${programName}</strong>. After careful review, we regret to inform you that your application was not selected for this cohort.
    </p>
    ${reasonBlock}
    <p style="margin:0 0 16px;font-size:14px;color:#4B5563;line-height:1.6;">
      We truly appreciate the time you took to apply. There will be more opportunities!
    </p>
    <p style="margin:0;font-size:14px;color:#6B7280;">
      Questions? Email us at <a href="mailto:gtech@connekt.gm" style="color:#D4A843;">gtech@connekt.gm</a>.
    </p>
  `);
}
