# Hasan Portfolio Full-Stack Version

This version has the frontend and backend connected.

## Project structure

```txt
hasan_portfolio_connected_fullstack/
├── public/
│   └── index.html      # Your portfolio frontend
├── server.js           # Express backend + email sending API
├── package.json
├── .env.example
└── README.md
```

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```txt
http://localhost:5000
```

## Important

The frontend form now sends this request:

```js
fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, message })
});
```

The backend receives it here:

```txt
POST /api/contact
```

## Gmail setup

Use a Gmail App Password.

1. Enable 2-Step Verification on your Google account.
2. Create an App Password.
3. Put the app password in `.env` as `EMAIL_PASS`.

Example `.env`:

```env
PORT=5000
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16_character_gmail_app_password
RECEIVER_EMAIL=yourgmail@gmail.com
FRONTEND_URL=http://localhost:5000
```

Do not upload `.env` to GitHub.
