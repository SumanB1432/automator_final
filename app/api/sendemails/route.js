// /app/api/sendemails/route.js
import nodemailer from "nodemailer";

export async function POST(req) {
  const { name, email, phoneNumber, userQuery } = await req.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_GMAIL_USER, // your email here
      pass: process.env.NEXT_PUBLIC_GMAIL_PASS, // your email password or app password
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.NEXT_PUBLIC_RECIPIENT_EMAIL, // where the email is going
    subject: "New Query from Contact Us Form",
    text: `User Name: ${name}\nPhone Number: ${phoneNumber}\nQuery: ${userQuery}\nEmail: ${email}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ message: "Email sent successfully!" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ message: "Failed to send email" }), {
      status: 500,
    });
  }
}
