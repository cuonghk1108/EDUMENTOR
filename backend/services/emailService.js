const nodemailer = require('nodemailer');

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('SMTP chưa được cấu hình. Thiếu SMTP_USER hoặc SMTP_PASS.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
};

const sendResetPasswordEmail = async ({ toEmail, resetLink }) => {
  const transporter = getTransporter();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER || 'edumentor.hk@gmail.com';
  const supportEmail = process.env.FORGOT_PASSWORD_SUPPORT_EMAIL || 'edumentor.hk@gmail.com';
  const currentYear = new Date().getFullYear();

  await transporter.sendMail({
    from: `"EDUMENTOR" <${fromEmail}>`,
    to: toEmail,
    subject: '✨ EDUMENTOR | Đặt lại mật khẩu an toàn',
    text: `EDUMENTOR - Đặt lại mật khẩu

Bạn vừa gửi yêu cầu đổi mật khẩu cho tài khoản EDUMENTOR.

Nhấn vào liên kết sau để đặt lại mật khẩu (hiệu lực 15 phút):
${resetLink}

Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.

Hỗ trợ: ${supportEmail}`,
    html: `
      <div style="margin:0;padding:0;background:#060b1f;font-family:Arial,'Segoe UI',sans-serif;color:#e2e8f0;">
        <div style="max-width:660px;margin:0 auto;padding:30px 14px;background:
          radial-gradient(circle at 10% 10%, rgba(56,189,248,0.20), transparent 30%),
          radial-gradient(circle at 85% 20%, rgba(236,72,153,0.18), transparent 35%),
          radial-gradient(circle at 50% 100%, rgba(139,92,246,0.24), transparent 40%),
          linear-gradient(160deg,#020617,#0f172a 45%,#111827);">

          <div style="border-radius:22px;overflow:hidden;border:1px solid rgba(148,163,184,0.35);box-shadow:0 20px 60px rgba(0,0,0,0.45);background:rgba(15,23,42,0.72);">
            <div style="padding:26px 28px 18px;background:
              linear-gradient(125deg, rgba(34,211,238,0.20), rgba(56,189,248,0.08) 35%, rgba(139,92,246,0.22) 65%, rgba(236,72,153,0.24));
              border-bottom:1px solid rgba(148,163,184,0.32);">

              <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(15,23,42,0.58);border:1px solid rgba(125,211,252,0.35);font-size:12px;font-weight:700;letter-spacing:1.1px;color:#7dd3fc;">
                EDUMENTOR SECURITY SYSTEM
              </div>

              <h1 style="margin:14px 0 8px;font-size:28px;line-height:1.25;font-weight:800;color:#f8fafc;">
                Đặt lại mật khẩu tài khoản
              </h1>
              <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.65;">
                Xác minh bảo mật nhanh chóng để tiếp tục hành trình học tập với AI.
              </p>
            </div>

            <div style="padding:28px;line-height:1.75;">
              <p style="margin:0 0 14px;color:#e2e8f0;">Xin chào,</p>
              <p style="margin:0 0 16px;color:#cbd5e1;">
                Hệ thống vừa nhận được yêu cầu đổi mật khẩu cho tài khoản <strong style="color:#f8fafc;">EDUMENTOR</strong> của bạn.
                Vui lòng xác nhận bằng nút bên dưới.
              </p>

              <div style="text-align:center;margin:26px 0 24px;">
                <a href="${resetLink}" style="display:inline-block;text-decoration:none;padding:14px 28px;border-radius:12px;
                  background:linear-gradient(120deg,#06b6d4,#3b82f6 40%,#8b5cf6 75%,#ec4899);
                  color:#ffffff;font-weight:800;font-size:15px;letter-spacing:0.2px;
                  box-shadow:0 8px 24px rgba(14,165,233,0.35);">
                  🔐 Đặt lại mật khẩu ngay
                </a>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;border-radius:14px;overflow:hidden;border:1px solid rgba(125,211,252,0.26);background:rgba(15,23,42,0.55);margin:0 0 18px;">
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid rgba(148,163,184,0.18);font-size:12px;letter-spacing:0.8px;color:#7dd3fc;font-weight:700;">
                    LINK DỰ PHÒNG
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;word-break:break-all;font-size:13px;color:#cbd5e1;line-height:1.6;">
                    ${resetLink}
                  </td>
                </tr>
              </table>

              <div style="border-left:3px solid #38bdf8;background:rgba(30,41,59,0.65);padding:12px 14px;border-radius:8px;margin:0 0 16px;">
                <p style="margin:0 0 8px;font-size:13px;color:#bae6fd;"><strong>Lưu ý bảo mật:</strong></p>
                <p style="margin:0;font-size:13px;color:#cbd5e1;">Liên kết có hiệu lực trong <strong>15 phút</strong> và chỉ dùng một lần.</p>
              </div>

              <ul style="padding-left:18px;margin:0 0 14px;color:#cbd5e1;font-size:14px;">
                <li>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</li>
                <li>Không chia sẻ liên kết này cho bất kỳ ai.</li>
              </ul>

              <p style="margin:0;font-size:14px;color:#94a3b8;">
                Hỗ trợ 24/7: <a href="mailto:${supportEmail}" style="color:#7dd3fc;text-decoration:none;font-weight:700;">${supportEmail}</a>
              </p>
            </div>

            <div style="padding:16px 28px;background:rgba(15,23,42,0.75);border-top:1px solid rgba(148,163,184,0.24);">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                © ${currentYear} EDUMENTOR · Smart Learning Platform · Powered by AI
              </p>
            </div>
          </div>
        </div>
      </div>
    `
  });
};

module.exports = {
  sendResetPasswordEmail
};
