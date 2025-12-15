const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

/* =======================
   CORS CONFIG
======================= */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

/* =======================
   EMAIL TEMPLATE
======================= */
const getEmailTemplate = (name, phone, email, message) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>New Contact</title>
  </head>
  <body style="font-family: Arial; background:#f4f4f4; padding:20px;">
    <div style="max-width:600px; background:#fff; margin:auto; padding:30px; border-radius:6px;">
      <h2 style="color:#222;">📩 New Contact Form Submission</h2>
      <hr />

      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>

      <h3 style="margin-top:20px;">Message</h3>
      <p style="background:#f9f9f9; padding:15px; border-left:4px solid #0066cc;">
        ${message}
      </p>

      <p style="margin-top:30px; font-size:12px; color:#888;">
        Received on ${new Date().toLocaleString()}
      </p>
    </div>
  </body>
  </html>
  `;
};

/* =======================
   NODEMAILER CONFIG
======================= */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: "digitalworkshop90@gmail.com",
    pass: 'kyebnjfpetxatbrq'
  }
});

/* =======================
   API: SEND CONTACT
======================= */
app.post('/api/send-contact', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!name || !phone || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, Phone, Email and Message are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    const html = getEmailTemplate(name, phone, email, message);

    const mailOptions = {
      from: `"HCI ONE Contact" <digitalworkshop90@gmail.com>`,
      to: 'digitalworkshop90@gmail.com',
      subject: `New Contact from ${name}`,
      html,
      text: `
Name: ${name}
Phone: ${phone}
Email: ${email}
Message: ${message}
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Email sending failed'
    });
  }
});

/* =======================
   HEALTH CHECK
======================= */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;