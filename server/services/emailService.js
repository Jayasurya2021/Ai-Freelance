const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        return null;
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

exports.sendEmail = async (to, subject, text) => {
    if (!transporter) {
        transporter = initTransporter();
    }
    
    // Graceful fallback if credentials are missing
    if (!transporter) {
        console.warn("Email Service Disabled: SMTP credentials missing in .env");
        return { success: false, message: "Service disabled" };
    }

    try {
        await transporter.sendMail({
            from: `"LeadFlow AI" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send email:", error.message);
        // Do not crash the app
        return { success: false, message: error.message };
    }
};
