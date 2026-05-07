const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  helmet({
    contentSecurityPolicy: false, // Keeps external image/stat cards and inline CSS/JS working for this single HTML portfolio.
  })
);

app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ extended: true, limit: "30kb" }));

// If frontend and backend are deployed together, CORS is not needed.
// This allows local/custom frontend origins if you set FRONTEND_URL in .env.
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : true,
    methods: ["GET", "POST"],
  })
);

app.use(
  "/api/contact",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many messages sent. Please try again after 15 minutes.",
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));

function clean(value) {
  return String(value || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Portfolio backend is running." });
});

app.post("/api/contact", async (req, res) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email);
    const message = clean(req.body.message);

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (name.length > 100 || email.length > 180 || message.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Your message is too long.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service is not configured yet.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    await transporter.sendMail({
      from: `"Hasan Portfolio" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>New Portfolio Contact Message</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Contact email error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
});
