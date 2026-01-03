import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: import.meta.env.EMAIL_HOST,
    port: Number(import.meta.env.EMAIL_PORT) || 8025,
    secure: import.meta.env.SECURE_OPTION === 'true',
    tls: {
        rejectUnauthorized: false, // no TLS
    },
});

export async function sendProjectCompletedNotification(to: string, id: string) {
    return await transporter.sendMail({
        from: import.meta.env.EMAIL_FROM,
        to: to,
        subject: "You project has been completed",
        text: `Your project (ID: ${id}) has been completed`,
        html: `<h1>Your project (ID: ${id}) has been completed</h1>`,
    });
}