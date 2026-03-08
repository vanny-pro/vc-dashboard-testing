# Production Deployment Guide (Vercel)

This project has been migrated to the Next.js App Router and is perfectly tuned for a 1-click deployment on Vercel.

## 🚀 How to Deploy on Vercel

1. **Push your code to GitHub:** (You have already done this!) Make sure everything is committed and pushed to your `main` branch.
2. **Log into Vercel:** Go to [vercel.com](https://vercel.com/) and log in with your GitHub account.
3. **Import the Project:** 
   - Click **"Add New..."** > **"Project"**
   - Find your repository (`vc-dashboard-testing`) in the list under the "Import Git Repository" section and click **Import**.
4. **Configure Environment Variables:**
   - On the configuration screen, open the **Environment Variables** tab.
   - Add the following variables exactly as they are in your `.env` file:
     - `NEXT_PUBLIC_GEMINI_API_KEY` (Your Gemini Key)
     - `DATA_SOURCE` (Set to `supabase`)
     - `SUPABASE_URL` (Your Supabase URL)
     - `SUPABASE_ANON_KEY` (Your Supabase Anon Key)
5. **Deploy:** Click the big **Deploy** button.

Once Vercel finishes building the app (takes about 1-2 minutes), you will receive a public URL (like `https://vc-dashboard-testing.vercel.app`). Your dashboard is now live and talking perfectly to Supabase!
