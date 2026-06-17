# CAT Prep Tracker 🎯
### Full-Stack Node.js + MongoDB + Express App

A complete CAT exam preparation tracker with user authentication, daily task planning, topic progress tracking, and mock test logging.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS (no framework needed) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Atlas recommended) |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Hosting | Railway / Render / Heroku / VPS |

---

## 📁 Project Structure

```
cat-prep-tracker/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema + bcrypt password hashing
│   │   ├── Task.js          # Daily tasks schema
│   │   ├── MockTest.js      # Mock test results schema
│   │   └── TopicProgress.js # Per-topic progress schema
│   ├── routes/
│   │   ├── auth.js          # POST /register, POST /login, GET /me
│   │   ├── tasks.js         # CRUD + stats for tasks
│   │   ├── mocks.js         # CRUD for mock tests
│   │   └── progress.js      # CRUD for topic progress
│   ├── middleware/
│   │   └── auth.js          # JWT verification middleware
│   ├── server.js            # Express app + MongoDB connection
│   ├── package.json
│   └── .env.example         # ← Copy to .env and fill in values
├── frontend/
│   └── public/
│       └── index.html       # Complete SPA frontend
├── Procfile                 # Heroku / Railway
├── railway.toml             # Railway specific config
├── render.yaml              # Render specific config
└── README.md
```

---

## ⚙️ Local Development Setup

### Step 1: Clone / Download Project
```bash
git clone <your-repo-url>
cd cat-prep-tracker
```

### Step 2: Install Dependencies
```bash
cd backend
npm install
```

### Step 3: Set Up MongoDB Atlas (Free)
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free account → Create a free M0 cluster
3. Click **Connect** → **Connect your application**
4. Copy the connection string (looks like `mongodb+srv://...`)
5. Replace `<password>` with your database user password

### Step 4: Configure Environment Variables
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/cat_prep_db
JWT_SECRET=any_long_random_string_at_least_32_characters
PORT=5000
FRONTEND_URL=http://localhost:5000
NODE_ENV=development
```

### Step 5: Run the App
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

Open: **http://localhost:5000**

---

## 🌍 Hosting The Full App

This project is a full-stack Node.js app. Use Render or Railway for the real hosted site.
GitHub Pages can only show static files and cannot run login, MongoDB, or AI routes.

### Render Settings

Create a new **Web Service** from this repo and use:

```text
Build Command: cd backend && npm install
Start Command: node backend/server.js
Health Check Path: /api/health
```

Add these environment variables in Render:

```env
MONGODB_URI=mongodb+srv://DB_USER:DB_PASSWORD@cluster0.xxxxx.mongodb.net/cat_prep_db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=use_a_long_random_secret_32_chars_or_more
NODE_ENV=production
FRONTEND_URL=https://your-render-app-name.onrender.com
OPENAI_MODEL=gpt-4o-mini
```

Optional, only if you want the AI coach to call OpenAI:

```env
OPENAI_API_KEY=your_openai_api_key
```

Make sure the MongoDB Atlas database user has the correct password and Atlas Network Access allows Render. For quick testing, allow `0.0.0.0/0`; for production, restrict access more tightly.

---

## 🌐 Deployment Guide

### Option A: Railway (Recommended — Easiest)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard:
   - `MONGODB_URI` → your Atlas connection string
   - `JWT_SECRET` → any random 32+ char string
   - `NODE_ENV` → `production`
   - `FRONTEND_URL` → your Railway app URL (set after first deploy)
4. Railway auto-detects `railway.toml` and deploys ✅

### Option B: Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect GitHub
3. Set:
   - Build Command: `cd backend && npm install`
   - Start Command: `node backend/server.js`
4. Add environment variables (same as above)
5. Deploy ✅

### Option C: Heroku

```bash
# Install Heroku CLI, then:
heroku create your-cat-prep-app
heroku config:set MONGODB_URI="your_atlas_uri"
heroku config:set JWT_SECRET="your_secret"
heroku config:set NODE_ENV=production
git push heroku main
```

### Option D: VPS (DigitalOcean / AWS EC2)

```bash
# On your server:
git clone <repo>
cd cat-prep-tracker/backend
npm install
# Install PM2 for process management:
npm install -g pm2
# Create .env file with your values
pm2 start server.js --name cat-prep
pm2 startup   # auto-start on reboot
pm2 save
```

Then set up Nginx as a reverse proxy pointing to port 5000.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/profile` | Update profile |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?date=YYYY-MM-DD` | Get tasks (filter by date) |
| GET | `/api/tasks?from=...&to=...` | Get tasks in date range |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update/toggle task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/stats/summary` | Dashboard stats + streak |

### Mock Tests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mocks` | All mock tests |
| POST | `/api/mocks` | Log new mock |
| PATCH | `/api/mocks/:id` | Update mock |
| DELETE | `/api/mocks/:id` | Delete mock |
| GET | `/api/mocks/stats/trend` | Stats (best, avg, count) |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | All topic progress |
| PUT | `/api/progress/:topicKey` | Update topic % (upsert) |
| GET | `/api/progress/summary/all` | Subject-level summary |

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT tokens expire in **30 days**
- All task/mock/progress routes are **user-isolated** (can't access other users' data)
- CORS configured for your frontend URL only
- Input validation on all routes

---

## 📊 Data Models

### User
```js
{ name, email, password (hashed), targetYear, targetPercentile, examDate }
```

### Task
```js
{ user, title, subject (VARC/DILR/QA), topic, date, hours, done, notes, completedAt }
```

### MockTest
```js
{ user, name, date, scores: {varc, dilr, qa}, totalScore, percentile, attemptedBy, notes }
```

### TopicProgress
```js
{ user, subject, topicKey, topicName, percentage, status, lastStudied }
```

---

## 🎓 CAT Sections Covered

| Section | Questions | Marks | Topics |
|---------|-----------|-------|--------|
| VARC | 26 | 72 | RC, Para Jumbles, Summary, Grammar… |
| DILR | 20 | 60 | Graphs, Tables, Seating, Puzzles… |
| QA | 22 | 76 | Numbers, Algebra, Geometry, Modern Math… |
| **Total** | **66** | **198** | |

> Note: Negative marking of -1 for wrong MCQ answers. TITA questions have no negative marking.

---

## 🛠 Troubleshooting

**MongoDB connection fails:**
- Check your Atlas IP whitelist (allow `0.0.0.0/0` for hosting, or add your server IP)
- Verify the connection string has correct username/password
- Ensure the cluster is running (not paused)

**JWT errors:**
- Make sure `JWT_SECRET` is set and the same across restarts
- Clear browser localStorage if token is stale

**CORS errors:**
- Set `FRONTEND_URL` to exactly your frontend domain (no trailing slash)
- If frontend and backend are on the same domain, CORS is automatic

---

*Built for IIM aspirants. Good luck with CAT! 🎯*
