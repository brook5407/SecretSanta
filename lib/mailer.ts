import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

export const sendEmail = async (
    name: string,
    email: string,
    recipient: string
) => {
    await transporter.sendMail({
      from: `<${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your Secret Santa Match Is Here!",
      html: `
        <p>Hi ${name},</p>

        <p>Thank you for joining our company Secret Santa! We’re thrilled to let you know who you’ll be gifting this holiday season.</p>
        
        <p>🎁 Your Secret Santa match is: <strong>${recipient}</strong></p>
        
        <p>Please keep it a secret and make sure to bring something thoughtful and fun to make their day!</p>
        
        <p>If you have any questions or need more details, feel free to reach out to us. Thanks for being a part of the fun, and happy gifting!</p>
        
        <p>Best wishes,<br><strong>${process.env.MAIL_USERNAME} 🎅</strong></p>

        <p>This is an auto-generated email. Please do not reply to this message.</p>
      `,
    }); 
}
