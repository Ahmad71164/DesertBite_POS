# 🚀 Desert Bite — Cloud Deployment Guide

This guide walks you through deploying **Desert Bite POS** using a free, reliable cloud stack with **NO COLD STARTS**:

- 🗄️ **Database**: [Neon](https://neon.tech) (Free PostgreSQL)
- ⚡ **API Server**: [Railway](https://railway.app) (Always-on Node.js Express server)
- 🖥️ **Frontend App**: [Vercel](https://vercel.com) (React + Vite static SPA on global CDN)

---

## 📋 Overview & Prerequisites

Before deploying, ensure you have created free accounts on:
1. [GitHub](https://github.com)
2. [Neon](https://neon.tech)
3. [Railway](https://railway.app)
4. [Vercel](https://vercel.com)

---

## Step 1: Create Free Neon PostgreSQL Database (3 minutes)

1. Sign in to **[neon.tech](https://neon.tech)**.
2. Click **Create Project**, name it `desert-bite`.
3. Select your preferred region (e.g., US East or Europe).
4. Once created, copy your **Connection String** from the dashboard:
   ```text
   postgresql://alex:password@ep-cool-flower-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   *(Keep this string safe — you will need it for Railway).*

---

## Step 2: Push Repository to GitHub (3 minutes)

Open terminal/PowerShell in the project root folder:

```bash
# Initialize git (if not done already)
git init
git add .
git commit -m "Configure Desert Bite for cloud deployment (PostgreSQL, Railway, Vercel)"

# Create a new repository on GitHub (e.g., named 'desert-bite'), then run:
git remote add origin https://github.com/YOUR_USERNAME/desert-bite.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy API Backend on Railway (5 minutes)

1. Sign in to **[railway.app](https://railway.app)** using your GitHub account.
2. Click **+ New Project** → Select **Deploy from GitHub repo**.
3. Choose your `desert-bite` repository.
4. Click **Add Variables** and configure:
   - `DATABASE_URL` = *(Your Neon connection string from Step 1)*
   - `JWT_SECRET` = `a-very-strong-secret-key-for-desert-bite-2026`
   - `PORT` = `5000`
5. Go to **Settings** tab:
   - Under **General** → Set **Root Directory** to `apps/api`.
   - Under **Networking** → Click **Generate Domain** (e.g. `desert-bite-api.up.railway.app`).
6. Go to **Deployments** → Wait for the deployment to finish.
7. Run Database Migrations & Initial Seed:
   - Click on the service → **View Logs** or **Variables** → Click **Run Command** (or open Railway CLI):
     ```bash
     npm run db:migrate && npm run db:seed
     ```
8. Verify your API health by visiting: `https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/health`

---

## Step 4: Deploy Web Frontend on Vercel (3 minutes)

1. Sign in to **[vercel.com](https://vercel.com)** using your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your `desert-bite` GitHub repository.
4. In the configuration screen:
   - **Framework Preset**: Vite
   - **Root Directory**: Click *Edit* and select `apps/web`
5. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://YOUR-RAILWAY-DOMAIN.up.railway.app`
6. Click **Deploy**.

Vercel will build and deploy your POS frontend in ~1 minute!

---

## 🎯 Verification Checklist

- [ ] Visit your Vercel URL (e.g. `https://desert-bite.vercel.app`)
- [ ] Sign in with the default admin account:
  - **Email**: `admin@desertbite.com`
  - **Password**: `admin123`
- [ ] Test creating an order in the POS terminal.
- [ ] Check Kitchen Display System (KDS) and Analytics pages.

---

## 🔒 Security Tip
After completing the initial setup, change the default admin password in the **Settings** or **Users** management section!
