const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_EMAIL_PASSWORD
    }
});

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"${process.env.APP_NAME}" <${process.env.SENDER_EMAIL}>`,
            to: to,
            subject: subject,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending email to ${to} (Subject: ${subject}):`, error);
        // In a production app, you might want to log this error to a dedicated error tracking service
    }
};

module.exports = sendEmail;