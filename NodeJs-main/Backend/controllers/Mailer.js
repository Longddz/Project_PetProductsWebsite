const nodemailer = require('nodemailer');
require('dotenv').config(); // Import dotenv

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: process.env.EMAIL_USER, // Lấy từ biến môi trường
                pass: process.env.EMAIL_PASS  // Lấy từ biến môi trường
            }
        });
    }

    async sendMail(mailOptions) {
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Đã gửi mail thành công!');
        } catch (error) {
            console.log('Lỗi khi gửi mail:', error);
            throw error;
        }
    }

    createMailOptions(to, subject, text = '', attachments = []) {
        return {
            from: process.env.EMAIL_USER, // Lấy từ biến môi trường
            to,
            subject,
            text,
            attachments
        };
    }
}

module.exports = EmailService;