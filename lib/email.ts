import nodemailer from 'nodemailer';

export async function sendResetPasswordEmail(to: string, resetLink: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Food Ordering Console" <${process.env.SMTP_USER}>`,
    to,
    subject: 'รีเซ็ตรหัสผ่าน - Food Ordering Console',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🍽️ Food Ordering Console</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937; margin-bottom: 16px;">รีเซ็ตรหัสผ่านของคุณ</h2>
          <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
            เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ<br>
            กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้จะหมดอายุใน <strong>1 ชั่วโมง</strong>
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white; padding: 14px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: bold; font-size: 16px;
                      display: inline-block;">
              รีเซ็ตรหัสผ่าน
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">
            หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © 2024 Food Ordering Console. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
}
