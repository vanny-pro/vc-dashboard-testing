# 🚀 NovaDash - SaaS Sales Dashboard

NovaDash is a clean, modern, and performant Sales Dashboard built with **React**, **Tailwind CSS 4**, and **Vite**. It features real-time data parsing from a backend Express API to provide actionable business insights through a premium user interface.

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

- **Frontend**: [React 19](https://reactjs.org/), [Vite 7](https://vitejs.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend API**: Node.js, [Express](https://expressjs.com/)
- **Database**: [Supabase](https://supabase.com/)

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
To start both the Vite development server and the backend API concurrently:
```bash
npm run dev
```
Then open your browser to `http://localhost:5173`.

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
