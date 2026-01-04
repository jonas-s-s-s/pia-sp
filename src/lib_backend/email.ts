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

export async function sendProjectFeedback(from: string, to: string, projectId: string, text: string) {
    return await transporter.sendMail({
        from: from,
        to: to,
        subject: "Admin has sent you feedback on your project",
        text: `Your project (ID: ${projectId}) has received feedback from an admin: ${text}`,
        html: `<h1>Your project (ID: ${projectId}) has received feedback from an admin:</h1> <p>${text}</p>`,
    });
}

export async function sendProjectAssigned(to: string, projectId: string) {
    return await transporter.sendMail({
        from: import.meta.env.EMAIL_FROM,
        to: to,
        subject: "A new project has been assigned to you",
        text: `The project (ID: ${projectId}) has been assigned to you`,
        html: `<h1>The project (ID: ${projectId}) has been assigned to you</h1>`,
    });
}

export async function sendFailedToAssignProject(to: string, projectId: string) {
    return await transporter.sendMail({
        from: import.meta.env.EMAIL_FROM,
        to: to,
        subject: "Failed to assign project",
        text: `The project (ID: ${projectId}) cannot be assigned. No translator is available. Try again later.`,
        html: `<h1>The project (ID: ${projectId}) cannot be assigned. No translator is available. Try again later.</h1>`,
    });
}