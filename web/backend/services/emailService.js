const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Or use SMTP settings from .env
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendEmail(to, subject, text, html) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
                html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('📧 Email sent: ' + info.response);
            return info;
        } catch (error) {
            console.error('❌ Email error:', error);
            throw error;
        }
    }

    async notifyAnomaly(recipients, deviceName, anomalyType, duration) {
        const subject = `⚠️ ANOMALY ALERT: ${deviceName} - ${anomalyType}`;
        const text = `An anomaly has been detected on ${deviceName}.\nType: ${anomalyType}\nDuration: ${duration} minutes.`;
        const html = `<h1>Anomaly Alert</h1><p><b>Device:</b> ${deviceName}</p><p><b>Type:</b> ${anomalyType}</p><p><b>Duration:</b> ${duration} minutes</p>`;

        await this.sendEmail(recipients, subject, text, html);
    }
}

module.exports = new EmailService();
