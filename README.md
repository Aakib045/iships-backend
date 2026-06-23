# IShips Backend

Lean Node/Express/MongoDB API for the IShips General Trading quote & inquiry system.

## Stack

- **Runtime**: Node 18+
- **Framework**: Express 4
- **Database**: MongoDB via Mongoose (Atlas recommended)
- **Email**: Resend HTTPS API (no SMTP — Railway blocks SMTP ports)
- **Auth**: JWT (single admin login)

## Project structure

```
server.js               Entry point
src/
  config/db.js          Mongoose connection
  models/Inquiry.js     Inquiry schema
  controllers/
    inquiryController.js  POST / GET / PATCH logic + Resend email
    adminController.js    JWT login
  routes/
    inquiries.js
    admin.js
  middleware/auth.js    JWT Bearer token guard
```

## Local setup

```bash
cp .env.example .env
# Fill in all values (see below)

npm install
npm run dev        # nodemon, hot-reload
# or
npm start          # plain node
```

## Environment variables

| Variable              | Description |
|-----------------------|-------------|
| `MONGODB_URI`         | Atlas connection string — **must include `/iships_db`** e.g. `mongodb+srv://user:pass@cluster.mongodb.net/iships_db` |
| `RESEND_API_KEY`      | From https://resend.com/api-keys |
| `FROM_ADDRESS`        | Verified sender address in Resend (e.g. `noreply@yourdomain.com`) |
| `OWNER_EMAIL`         | Where inquiry notifications are sent |
| `ADMIN_USERNAME`      | Admin login username |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password (see below) |
| `JWT_SECRET`          | Long random string for signing tokens |
| `PORT`                | Optional, defaults to 3000 |

### Generating the password hash

```bash
node -e "const b=require('bcryptjs'); b.hash('YOUR_PASSWORD',10).then(console.log)"
```

Paste the printed hash as `ADMIN_PASSWORD_HASH`.

## API reference

### Public

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/api/inquiries` | `{ name, email, phone?, division, message }` | `{ success: true, id }` |
| `POST` | `/api/admin/login` | `{ username, password }` | `{ token, expiresIn }` |
| `GET`  | `/health` | — | `{ status: "ok" }` |

**`division`** must be one of: `Scrap`, `Spare Parts`, `Import-Export`, `Other`

### Admin (Bearer token required)

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/inquiries` | List all inquiries, newest first |
| `PATCH`| `/api/inquiries/:id/read` | Mark an inquiry as read |

Include the token from `/api/admin/login` as:
```
Authorization: Bearer <token>
```

## Deploy to Railway

1. Push this repo to GitHub.
2. In Railway → **New Project** → **Deploy from GitHub repo** → select this repo.
3. Railway auto-detects Node and runs `npm start`.
4. Go to **Variables** and add all env vars from `.env.example`.
5. Add a **Custom Domain** or use the Railway-generated URL.
6. Update the frontend's `VITE_API_URL` (or equivalent) to point to the Railway URL.

> Railway exposes `PORT` automatically — the server reads `process.env.PORT` so no changes needed.
