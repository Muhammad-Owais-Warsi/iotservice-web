import nodemailer from 'nodemailer';

// Configure this with your actual SMTP provider (Resend, SendGrid, Gmail, etc.)
// For now, it defaults to logging to console if no env vars are present.
const checkConfig = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn("⚠️ SMTP Config missing. Emails will be logged to console only.");
        return false;
    }
    return true;
};

const transporter = checkConfig() ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
}) : null;

export async function sendEmail({ to, subject, text, html }) {
    console.log(`📧 [MOCK EMAIL] To: ${to} | Subject: ${subject}`);

    if (!transporter) {
        return { success: true, mocked: true };
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"IoT Service" <noreply@iotservice.com>',
            to,
            subject,
            text,
            html: html || text,
        });
        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
}
