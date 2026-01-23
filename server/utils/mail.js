const Mailgen = require("mailgen"); 
const nodemailer = require("nodemailer");


const sendEmail = async options => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "SmartTrack",
      link: process.env.CLIENT_URL || "http://localhost:5173",
    },
  });
  const emailText = mailGenerator.generatePlaintext(options.content);
  const emailHTML = mailGenerator.generate(options.content);
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });
  const mail = {
    from: "mail.taskmanage.example.com",
    to: options.email, //receivers email
    subject: options.subject,
    text: emailText,
    html: emailHTML,
  };
  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error("Email service failed ");
    console.error("Error", error);
  }

};

const emailVerificationMailGenContent = (username, verificationurl) => {
  
  return {
    body: {
      name: username,
      intro: "Welcome to our App! We are lucky to have you.",
      action: {
        instructions: "Please click on the button to verify your Email",
        button: {
          color: "#22BC66", 
          text: "Confirm your email",
          link: verificationurl,
        },
      },
      outro: "If you have any questions please reach out.",
    },
  };
};
const forgotPassMailGenContent = (username, passwordreset) => {
  
  return {
    body: {
      name: username,
      intro: "You have requested a password reset for your account.",
      action: {
        instructions: "Please click on the button to reset your password",
        button: {
          color: "#0d0e0dff", 
          text: "Confirm your password",
          link: passwordreset,
        },
      },
      outro: "If you have any questions please reach out.",
    },
  };
};

module.exports = { emailVerificationMailGenContent, forgotPassMailGenContent, sendEmail };
