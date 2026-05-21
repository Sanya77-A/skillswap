# SkillSwap – Peer-to-Peer Skill Exchange Platform

Full-stack MERN application: users create profiles with **skills they offer** and **want**, discover **matches**, send **swap requests**, **chat in real-time**, and leave **ratings/reviews** after completion.

## Tech Stack

- **Frontend:** React (Vite), Redux Toolkit, React Router, TailwindCSS, React Hook Form + Zod, Socket.io-client, Chart.js
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT (access + refresh), Socket.io, Multer + Cloudinary, Nodemailer, Helmet, CORS, rate-limit, mongo-sanitize, xss-clean

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- (Optional) Cloudinary account for profile images
- (Optional) SMTP for email (e.g. Gmail app password)

## Setup

### 1. Clone and install

```bash
cd skillswap
npm run install:all
```

### 2. Environment variables

**Server** (`server/.env`):

```bash
cp server/.env.example server/.env
# Edit server/.env: set MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_URL
# Optionally: CLOUDINARY_*, SMTP_*
```

**Client** (optional):

```bash
cp client/.env.example client/.env
```

### 3. Seed demo data (optional)

```bash
npm run seed
```

Creates users: `admin@skillswap.com` (admin), `alice@skillswap.com`, `bob@skillswap.com`, `carol@skillswap.com` (password: admin123 / alice123 / bob123 / carol123) and a sample swap request.

### 4. Run locally

```bash
npm run dev
```

- **API:** http://localhost:5000  
- **Client:** http://localhost:5173 (Vite proxy forwards `/api` and `/socket.io` to the server)

Or run separately:

```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

## Production upgrades (this codebase)

- **Matching**: Score algorithm (mutual +50, rating×10, availability +20, location +5, recent +10). `MatchCache` model and 12-hour cron.
- **Auth**: HTTP-only cookies, access 15m / refresh 7d, refresh token rotation, `verifyAccessToken` / `verifyRefreshToken` middlewares.
- **Chat**: Conversation `lastMessage`, `unreadCount`; Message `seenBy`, `attachments` (images/PDF via Cloudinary).
- **Sessions**: Session booking (proposedSlots, accept, complete). `POST/PATCH/GET /api/sessions`.
- **Notifications**: Real-time via Socket.io; types include SESSION_CONFIRMED.
- **Reports**: Report model and `POST /api/reports`; admin `GET /api/admin/reports`.
- **Analytics**: `GET /api/analytics/user`, `GET /api/analytics/platform` (admin).
- **Security**: Helmet, rate limiting (stricter on auth), mongo-sanitize, xss-clean, CORS.
- **Tests**: Jest + Supertest (auth, match score, swap requests). `cd server && npm test`.
- **Docker**: `server/Dockerfile`, `client/Dockerfile`, `docker-compose.yml` (client, server, mongodb).
- **Docs**: `ARCHITECTURE.md`, `SECURITY.md`, `SCALING.md`.

## Project structure (monorepo)

```
skillswap/
├── server/
│   └── src/
│       ├── config/       # db, cloudinary
│       ├── models/       # User, SwapRequest, Conversation, Message, Review, Notification, RefreshToken, MatchCache, Session, Report
│       ├── routes/
│       ├── controllers/
│       ├── services/     # matchService, emailService, socketService, notificationService
│       ├── middlewares/  # auth, role, validate, error, upload
│       ├── validators/   # Zod schemas
│       ├── utils/        # tokens, pagination, logger
│       ├── socket/       # Socket.io setup
│       ├── scripts/      # seed.js
│       ├── app.js
│       └── server.js
├── client/
│   └── src/
│       ├── app/          # Redux store
│       ├── features/     # auth, user, matches, requests, chat, notifications, dashboard, admin
│       ├── components/
│       ├── pages/
│       ├── hooks/        # useSocket
│       └── utils/        # api
├── package.json
└── README.md
```

## API overview

- **Auth:** `POST /api/auth/register`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`
- **Users:** `GET/PUT/DELETE /api/users/me`, `GET /api/users` (search), `GET /api/users/:id`, `GET /api/users/:id/reviews`
- **Matches:** `GET /api/matches` (paginated, ranked)
- **Requests:** `POST /api/requests`, `GET /api/requests?type=incoming|outgoing`, `PATCH /api/requests/:id`
- **Chat:** `GET /api/chats`, `POST /api/chats/conversation`, `GET/POST /api/chats/:conversationId/messages`
- **Reviews:** `POST /api/reviews`
- **Notifications:** `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`
- **Dashboard:** `GET /api/dashboard/stats`
- **Admin:** `GET /api/admin/users`, `PATCH /api/admin/users/:id/block|unblock`, `DELETE /api/admin/users/:id`, `GET /api/admin/stats`

## Matching and chat

- **Matching:** Recommended matches are computed by overlap: your `skillsWanted` with others’ `skillsOffered`, and your `skillsOffered` with others’ `skillsWanted`. Results are ranked (mutual match first
, then by rating and activity).
- **Chat:** Socket.io authenticates with the JWT access token. Chat is allowed only between users who have an **ACCEPTED** or **COMPLETED** swap. Messages are stored in MongoDB; the server emits `message` to the recipient and `online_users` for the presence list.

## Example requests (curl)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
# Use the returned accessToken in header: Authorization: Bearer <accessToken>

# Get matches
curl http://localhost:5000/api/matches -H "Authorization: Bearer <accessToken>"
```

## Deploy on Vercel (frontend)

The **client** can be deployed on Vercel. The **server** must be hosted elsewhere (e.g. [Railway](https://railway.app), [Render](https://render.com), or a VPS).

### 1. Deploy the backend first

- Deploy the **server** (Node/Express) to Railway, Render, or similar. Set env vars: `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and **`CLIENT_URL`** = your Vercel frontend URL (e.g. `https://skillswap.vercel.app`).
- Note the backend URL (e.g. `https://skillswap-api.railway.app`).

### 2. Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** → **Project** and import the `Samtav007/skillswap` repo.
3. Configure the project:
   - **Root Directory:** set to **`client`** (so Vercel builds only the React app).
   - **Framework Preset:** Vite (auto-detected).
   - **Build Command:** `npm run build` (default).
   - **Output Directory:** `dist` (default).
4. **Environment variables:** add:
   - **`VITE_API_URL`** = your backend URL **without** `/api` (e.g. `https://skillswap-api.railway.app`).  
     The app will call `{VITE_API_URL}/api` and connect Socket.io to `{VITE_API_URL}`.
5. Click **Deploy**.

### 3. CORS and cookies

- The server already uses `CLIENT_URL` for CORS. Set it to your Vercel URL so the browser allows requests.
- If you use HTTP-only cookies across domains (frontend on Vercel, API on Railway), the server may need `SameSite=None; Secure` for cookies in production. The backend may require a small change for cross-origin cookies depending on your setup.

## Build for production

```bash
npm run build
# Serve client build (e.g. from server/public) and run server with NODE_ENV=production
```

## Docker

```bash
docker-compose up -d
# MongoDB: 27017, Server: 5000, Client (nginx): 80
```

Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in env or in docker-compose.

## Testing

```bash
cd server && npm install && npm test
```

Uses Jest + Supertest. Auth and request tests require MongoDB (e.g. `MONGO_URI=mongodb://localhost:27017/skillswap_test`).

## Documentation

- **ARCHITECTURE.md** — System design, auth flow, chat flow, matching.
- **SECURITY.md** — JWT rotation, HTTP-only cookies, threat prevention.
- **SCALING.md** — 100 / 10k / 1M user scaling notes.

## License

MIT
