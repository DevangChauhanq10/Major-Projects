
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const testEmail = async () => {
  console.log("Testing Email Connection...");
  console.log("HOST:", process.env.MAILTRAP_SMTP_HOST);
  console.log("PORT:", process.env.MAILTRAP_SMTP_PORT);
  console.log("USER:", process.env.MAILTRAP_SMTP_USER);
  
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Test Script" <test@example.com>',
      to: "test@example.com",
      subject: "Test Email from Script",
      text: "If you see this, email sending is working!",
    });
    console.log("✅ Message sent: %s", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

testEmail();
