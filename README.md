# 🚀 NovaDash - SaaS Sales Dashboard

NovaDash is a clean, modern, and performant Sales Dashboard built with **Next.js App Router**, **Tailwind CSS 4**, and **React**. It features real-time data parsing from a Next.js built-in API Route to provide actionable business insights through a premium user interface.

## ✨ Features

- **📊 Real-time KPIs**: Instantly see Total Revenue, Orders, Gross Profit, and Average Order Value (AOV).
- **📋 Transaction Table**: A detailed, scrollable list of sales activities with product and channel breakdowns.
- **🎨 Premium UI**: 
  - Clean SaaS layout with sidebar and sticky header.
  - Responsive design for different device sizes.
  - Smooth entrance animations using **Framer Motion**.
  - Indigo-themed professional color palette.
- **📁 Hybrid Data Layer**: Dynamically reads data from either a local CSV or **Supabase PostgreSQL**.
- **🧠 Gemini AI**: Analyzes data directly mapped to Google Gemini API insights.

## 🛠️ Tech Stack

- **Frontend/Backend**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation
1. **Clone or download** the project.
2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running Locally
To start the Next.js development server:
```bash
npm run dev
```
Then open your browser to `http://localhost:3000`.

---

## 🗄️ Setting Up Supabase (Database)

The backend API is configured to read data from a local CSV by default, but is fully ready to connect to Supabase.

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In the SQL Editor, create the sales_data table by running this SQL snippet:
   ```sql
   CREATE TABLE sales_data (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     date date,
     product text,
     channel text,
     orders integer,
     revenue numeric,
     cost numeric,
     visitors integer,
     customers integer
   );
   ```
3. Import your CSV data into this table via the Supabase Table Editor.
4. Go to Project Settings -> API to get your URL and Anon Key.
5. In your local `.env` file, add your credentials and set the DATA_SOURCE:
   ```env
   DATA_SOURCE=supabase
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   ```
6. Restart your development server. The API will now serve data directly from Supabase!

---

## 🚀 Deploy to Vercel (Production)

This project has been fully migrated to Next.js and is optimized for Vercel.

1. Ensure your repository is pushed to GitHub.
2. Go to [vercel.com](https://vercel.com/) and link your GitHub account.
3. Import your `vc-dashboard-testing` repository.
4. Add these Environment Variables in the Vercel dashboard:
   - `NEXT_PUBLIC_GEMINI_API_KEY`
   - `DATA_SOURCE`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Click **Deploy**.

For more detailed instructions, checkout `production.md`.
