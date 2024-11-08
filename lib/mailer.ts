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
      from: `"TWM Committee Team 2024" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your Secret Santa Match Is Here!",
      html: `
        <p>Hi ${name},</p>

        <p>Thank you for joining our company Secret Santa! We’re thrilled to let you know who you’ll be gifting this holiday season.</p>
        
        <p>🎁 Your Secret Santa match is: <strong>${recipient}</strong></p>
        
        <p>Please keep it a secret and make sure to bring something thoughtful and fun to make their day! Here are a few details to help you plan your gift:</p>
        
        <ul style="list-style-type: none; padding: 0;">
            <li><strong>Gift exchange date:</strong> 28 Nov 2024</li>
            <li><strong>Gift budget:</strong> $20</li>
        </ul>

        <p>Please mention the name of the person you are gifting on the gift and leave it in the meeting room when you ready.</p>
        
        <p>If you have any questions or need more details, feel free to reach out to us. Thanks for being a part of the fun, and happy gifting!</p>
        
        <p>Best wishes,<br><strong>TWM Commitee Team 2024 🎅</strong></p>

        <p>This is an auto-generated email. Please do not reply to this message.</p>
      `,
    }); 
}
