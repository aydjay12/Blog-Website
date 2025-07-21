import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter using Gmail SMTP
export const transporter = nodemailer.createTransport({
  service: "Gmail", // Use Gmail as the email service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password (not regular password)
  },
});

export const sender = {
  email: process.env.EMAIL_USER, // Your sender email (e.g., your Gmail)
  name: "My Blog",
};