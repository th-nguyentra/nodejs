import { env } from '@/configs';

export const buildInvitationEmail = (params: {
  senderUsername: string;
  boardName: string;
  token: string;
}): { subject: string; html: string } => {
  const { senderUsername, boardName, token } = params;
  const acceptUrl = `${env.appUrl}/invitations/accept?token=${token}`;

  return {
    subject: `You've been invited to join "${boardName}"`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0052cc;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">Trello Lite</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#172b4d;">Hi there,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#42526e;line-height:1.6;">
                <strong style="color:#172b4d;">${senderUsername}</strong> has invited you to collaborate on the board:
              </p>

              <!-- Board name pill -->
              <div style="background-color:#e6f0ff;border-left:4px solid #0052cc;border-radius:4px;padding:14px 20px;margin-bottom:32px;">
                <span style="font-size:16px;font-weight:700;color:#0052cc;">${boardName}</span>
              </div>

              <!-- Accept button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${acceptUrl}" style="display:inline-block;background-color:#0052cc;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:6px;">
                  Accept Invitation
                </a>
              </div>

              <p style="margin:0;font-size:13px;color:#97a0af;line-height:1.5;">
                This invitation will remain valid until cancelled by the board admin. If you weren't expecting this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f5f7;padding:20px 40px;text-align:center;border-top:1px solid #ebecf0;">
              <p style="margin:0;font-size:12px;color:#97a0af;">© ${new Date().getFullYear()} Trello Lite. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
};
