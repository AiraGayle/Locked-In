import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

export const resetEmail = async (to, resetLink) => {

    await transporter.sendMail(
        {
            from: '"Support" <${process.env.MAIL_USERS>',
            to,
            subject: 'Password Reset Request',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`,
        }
    );
};