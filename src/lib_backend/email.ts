import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: import.meta.env.EMAIL_HOST,
    port: Number(import.meta.env.EMAIL_PORT) || 8025,
    secure: import.meta.env.SECURE_OPTION === 'true',
    tls: {
        rejectUnauthorized: false, // no TLS
    },
});

export async function sendFeedbackEmail(to: string, message: string) {
    return await transporter.sendMail({
        from: import.meta.env.EMAIL_FROM,
        to: to,
        subject: "User has sent you feedback",
        text: "test", // plain‑text body
        html: "test_body", // HTML body
    });
}

//**********************************************************
//* HTML AND TEXT FOR ALL EMAILS
//**********************************************************

const verificationHtml = (verifyUrl: string) => `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <h2>Email Verification</h2>
  </body>
</html>
`.trim();

