# 🌐 Deploy Desert Bite POS to Vercel (Step-by-Step)

This guide walks you through deploying **Desert Bite POS** to **Vercel** with a free, persistent cloud PostgreSQL database (**Neon** or **Supabase**).

---

## ⚡ Quick Summary

- 🖥️ **Frontend & API**: Deployed together on **Vercel** (Vite SPA + Express Serverless API)
- 🗄️ **Database**: **Neon.tech** or **Supabase** (Free Cloud PostgreSQL)
- 🔑 **Default Admin Login**:
  - **Email**: `admin@desertbite.com` *(or `Admin`)*
  - **Password**: `admin123` *(or `DesertBite@786`)*

---

## Step 1: Create Free Cloud Database (2 Minutes)

1. Go to **[neon.tech](https://neon.tech)** (or **[supabase.com](https://supabase.com)**) and sign up for a free account.
2. Click **Create Project** -> Name it `desert-bite`.
3. Copy your PostgreSQL **Connection String** (`DATABASE_URL`). Example:
   ```text
   postgresql://alex:password123@ep-cool-flower-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Push Database Schema & Seed (1 Minute)

Run the included PowerShell helper script in your project root folder:

```powershell
.\setup-cloud-db.ps1
```

*(Paste your Neon `DATABASE_URL` when prompted).*

This creates all database tables and populates the default Desert Bite menu, tables, settings, and Admin user into the cloud database!

---

## Step 3: Deploy to Vercel (3 Minutes)

1. Push your latest code to your **GitHub** repository:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment with Cloud PostgreSQL"
   git push origin main
   ```
2. Go to **[vercel.com](https://vercel.com)** and sign in.
3. Click **Add New...** -> **Project**.
4. Import your `Desert Bite` GitHub repository.
5. In the Vercel project configuration screen:
   - **Framework Preset**: Other (or Vite)
   - Expand **Environment Variables** and add:
     - **Name**: `DATABASE_URL`
     - **Value**: *(Your Neon connection string from Step 1)*
     - **Name**: `JWT_SECRET`
     - **Value**: `desert-bite-production-secret-key-2026`
6. Click **Deploy**.

Vercel will build both the frontend SPA and the backend API serverless functions automatically in ~1 minute!

---

## 🎯 Verification & Login

1. Open your Vercel URL (e.g. `https://desert-bite-pos.vercel.app`).
2. Log in with:
   - **User**: `admin@desertbite.com`
   - **Password**: `admin123`
3. Enjoy your active, cloud-synced POS terminal from any phone, laptop, or desktop!
