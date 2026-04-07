# 🔥 LUCIFER on Netlify — Full Deployment Guide

> *From zero to live in under 15 minutes.*

---

## What You Need (all free)

| Service | What For | Sign Up |
|---------|----------|---------|
| **GitHub** | Host your code | github.com |
| **Netlify** | Deploy frontend + serverless functions | netlify.com |
| **Neon** | Free hosted PostgreSQL database | neon.tech |
| **Groq** | AI API key | console.groq.com |

---

## STEP 1 — Get Your Free Database (Neon)

1. Go to **https://neon.tech** → Sign up free
2. Click **"New Project"** → Name it `lucifer`
3. Choose region closest to you → **Create Project**
4. On the dashboard, click **"Connection string"**
5. Copy the string — looks like:
   ```
   postgresql://lucifer_owner:XXXX@ep-XXX.us-east-2.aws.neon.tech/lucifer?sslmode=require
   ```
6. **Save this** — you'll need it in Step 3

---

## STEP 2 — Get Your Groq API Key

1. Go to **https://console.groq.com**
2. Sign in → Click **"API Keys"** in the sidebar
3. Click **"Create API Key"** → Name it `lucifer`
4. **Copy the key** (starts with `gsk_...`) — save it

---

## STEP 3 — Push to GitHub

```bash
# 1. Unzip the project
unzip lucifer-netlify.zip
cd lucifer-netlify

# 2. Create a new GitHub repo at github.com/new
#    Name: lucifer  |  Private is fine  |  Don't add README

# 3. Push it up
git init
git add .
git commit -m "🔥 Lucifer awakens"
git remote add origin https://github.com/YOUR_USERNAME/lucifer.git
git branch -M main
git push -u origin main
```

---

## STEP 4 — Deploy on Netlify

1. Go to **https://netlify.com** → Log in → **"Add new site"**
2. Choose **"Import an existing project"**
3. Click **"GitHub"** → Authorize → Select your `lucifer` repo
4. Build settings (should auto-detect, but verify):
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** `20`
5. Click **"Add environment variables"** → Add ALL of these:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon connection string from Step 1 |
   | `GROQ_API_KEY` | Your key from Step 2 (`gsk_...`) |
   | `JWT_SECRET` | Any long random string (e.g. `lucifer_jwt_32_chars_random_abc123xyz`) |
   | `INIT_SECRET` | Any word you'll remember (e.g. `hellfire`) |
   | `NODE_VERSION` | `20` |

6. Click **"Deploy site"** → Wait 2–3 minutes ☕

---

## STEP 5 — Initialize Your Database

After deploy succeeds, open your Netlify URL and call:

```
https://YOUR-SITE.netlify.app/.netlify/functions/init-db?secret=hellfire
```

You should see:
```json
{
  "success": true,
  "message": "🔥 Lucifer database schema initialized. Tables created."
}
```

**This creates all database tables. Only needs to be done once.**

---

## STEP 6 — Open Lucifer

Go to your Netlify URL:
```
https://YOUR-SITE.netlify.app
```

1. Click **"Awaken"** tab → Register your account
2. Start commanding Lucifer 🔥

---

## Custom Domain (Optional)

1. In Netlify → **Site Settings → Domain management**
2. Click **"Add custom domain"** → Enter `lucifer.yourdomain.com`
3. Follow DNS instructions (add CNAME record at your registrar)
4. Netlify auto-provisions free SSL/HTTPS ✅

---

## Troubleshooting

### "Database error" on register/login
→ Make sure you ran the init-db step (Step 5)
→ Check your `DATABASE_URL` is correct in Netlify env vars

### Functions returning 500
→ Go to Netlify → **Functions** tab → Click a function → View logs
→ Most common: missing env var

### Build fails
→ Go to Netlify → **Deploys** → Click the failed deploy → Read logs
→ Usually a Node version issue — make sure `NODE_VERSION=20` is set

### "Unauthorized" errors
→ Your `JWT_SECRET` might have changed — log out and back in

---

## Re-deploying After Changes

```bash
# Make your changes, then:
git add .
git commit -m "update"
git push
# Netlify auto-deploys within 2 minutes ✨
```

---

## Architecture on Netlify

```
Your Browser
     │
     ▼
Netlify CDN (your-site.netlify.app)
     │
     ├── / → Next.js Pages (static + SSR)
     │
     └── /api/* → Netlify Functions (serverless)
              │
              ├── auth-register    → creates user account
              ├── auth-login       → returns JWT token
              ├── conversations    → list/update/delete
              ├── conversation     → load with messages
              ├── chat             → Groq API + save to DB
              ├── health           → status check
              └── init-db          → one-time schema setup
                       │
                       ▼
                 Neon PostgreSQL
                 (hosted, free tier)
                 ┌────────────────┐
                 │ users          │
                 │ conversations  │
                 │ messages       │
                 └────────────────┘
```

---

## Scaling on Netlify

Netlify's free tier handles:
- **125,000 function calls/month**
- **100 GB bandwidth/month**
- **300 build minutes/month**

For higher traffic → upgrade to **Netlify Pro** ($19/mo) for:
- 1M function invocations/month
- 400 GB bandwidth
- Background functions (longer timeouts)

For Neon database → free tier gives **512 MB storage**, plenty for thousands of conversations.

---

*"Better to reign in Netlify than serve in a data center."* 🔥
