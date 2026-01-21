# Vercel Deployment Guide

Since we moved the code to a new repository (`ibrar09/quotefrontend`), Vercel is likely still trying to pull from the old one. You need to update the connection.

## Option 1: Create a New Project (Recommended)

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  In the "Import Git Repository" list, find `ibrar09/quotefrontend`.
    - If you don't see it, click "Adjust GitHub App Permissions" to give Vercel access to the new repo.
4.  Click **"Import"**.
5.  **Build Settings**:
    - **Framework Preset**: Vite
    - **Root Directory**: `./` (leave default)
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
6.  **Environment Variables**:
    - Add any variables from your `.env.production` file (e.g., `VITE_API_BASE_URL`).
7.  Click **"Deploy"**.

## Option 2: Update Existing Project

1.  Go to your existing project in Vercel.
2.  Go to **Settings** -> **Git**.
3.  Under "Connected Git Repository", click **Disconnect**.
4.  Enter the new repository name: `ibrar09/quotefrontend`.
5.  Click **Connect**.
6.  Go to the **Deployments** tab and verify a new deployment starts (or click "Redeploy" on the latest commit).

## Troubleshooting

- **404 on Refresh**: The `vercel.json` file included in this repo handles routing for Single Page Apps.
- **Build Fails**: Check the "Build Logs" in Vercel. Ensure `npm run build` works locally first.
