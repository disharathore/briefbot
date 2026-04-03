# BriefBot — AI Document Assistant


Convert raw notes, meeting minutes, and CSV data into polished SOPs, reports,
emails, summaries, and checklists — powered by Claude AI.

---   

## What this project does

- Paste messy text OR upload a .csv/.txt file
- Choose output type: SOP, Report, Email, Summary, Checklist
- Choose tone: Professional, Friendly, Concise, Detailed
- AI generates a polished document instantly
- Every generated doc is auto-saved to a local SQLite database
- Dashboard to browse, search, filter, and delete past documents
- Export any document to PDF or TXT

---

## Tech stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14, React 18, TypeScript    |
| AI        | Anthropic Claude API (claude-opus-4-5) |
| Database  | SQLite via better-sqlite3           |
| PDF       | jsPDF                               |
| CSV parse | PapaParse                           |
| Deploy    | Vercel (free)                       |

---

## Step 1 — Install Node.js

You need Node.js version 18 or higher.

Check if you have it:
```
node --version
```

If the command fails or shows a version below 18, download it from:
https://nodejs.org  (click the "LTS" button and install)

---

## Step 2 — Get your Anthropic API key

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Click "API Keys" in the left sidebar
4. Click "Create Key"
5. Copy the key — it starts with `sk-ant-...`
6. Keep this key safe, never share it publicly

---

## Step 3 — Set up the project

Open your terminal (Command Prompt on Windows, Terminal on Mac).

Navigate to where you want the project to live:
```
cd Desktop
```

Clone or copy the briefbot folder there, then enter it:
```
cd briefbot
```

Install all dependencies (this downloads everything from package.json):
```
npm install
```

This takes 1-2 minutes. You will see a lot of text scroll by — that is normal.

---

## Step 4 — Add your API key

In the briefbot folder, create a file called `.env.local`

On Mac/Linux:
```
cp .env.local.example .env.local
```

On Windows (Command Prompt):
```
copy .env.local.example .env.local
```

Now open `.env.local` in any text editor (Notepad is fine) and replace:
```
ANTHROPIC_API_KEY=your_api_key_here
```
with your actual key:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxx
```

Save the file. Done.

---

## Step 5 — Run the app locally

```
npm run dev
```

You will see output like:
```
▲ Next.js 14.2.3
- Local: http://localhost:3000
```

Open your browser and go to: http://localhost:3000

The SQLite database file `briefbot.db` is created automatically the first time
you generate a document. You don't need to do anything for this.

---

## Step 6 — Use the app

**Generate page (http://localhost:3000)**
- Upload a .csv or .txt file OR paste raw notes in the text area
- Select output type (SOP, Report, Email, Summary, Checklist)
- Select tone (Professional, Friendly, Concise, Detailed)
- Click Generate
- The document appears below and is auto-saved

**Dashboard (http://localhost:3000/dashboard)**
- See all saved documents
- Search by keyword
- Filter by document type
- Expand any document to read it
- Export to PDF or TXT
- Delete documents

---

## Step 7 — Deploy to Vercel (free, get a live link)

This gives you a public URL like `https://briefbot-disha.vercel.app`
which you can put on your resume and show to recruiters.

### 7a — Push to GitHub

1. Go to https://github.com and create a new repository called `briefbot`
2. Make it public
3. In your terminal inside the briefbot folder:

```
git init
git add .
git commit -m "Initial commit — BriefBot AI document assistant"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/briefbot.git
git push -u origin main
```

Replace YOUR_USERNAME with your actual GitHub username.

### 7b — Deploy on Vercel

1. Go to https://vercel.com and sign up with your GitHub account
2. Click "Add New Project"
3. Find your `briefbot` repo and click Import
4. On the configuration screen, click "Environment Variables"
5. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your sk-ant-... key
6. Click Deploy

Vercel builds and deploys in about 2 minutes. You get a live URL.

**Important note about the database on Vercel:**
Vercel runs serverless functions — the SQLite file cannot persist between
requests. For a fully working deployed version with persistent storage, you
have two options:

Option A (easiest — free): Use Vercel's free Postgres database
- In Vercel dashboard → Storage → Create Database → Postgres
- Copy the `POSTGRES_URL` it gives you
- Replace the `better-sqlite3` DB calls with the `@vercel/postgres` package

Option B (simplest for demo — no DB): Just show the generate page working
with AI — the output is displayed in the UI and can be exported. The database
is for the dashboard's history feature.

For your resume and interview demo, Option B is fine. The AI generation,
PDF export, and the full UI all work perfectly without the DB on Vercel.

---

## File structure explained

```
briefbot/
├── src/
│   ├── app/
│   │   ├── page.tsx                  ← Generate page (main UI)
│   │   ├── layout.tsx                ← Root HTML wrapper + fonts
│   │   ├── globals.css               ← App-wide styles
│   │   ├── dashboard/
│   │   │   └── page.tsx              ← Document history dashboard
│   │   └── api/
│   │       ├── generate/route.ts     ← POST: calls Claude, saves to DB
│   │       └── documents/route.ts    ← GET: list docs, DELETE: remove doc
│   ├── components/
│   │   ├── Sidebar.tsx               ← Left navigation bar
│   │   ├── StatsBar.tsx              ← Docs count, time saved, words
│   │   ├── UploadZone.tsx            ← Drag-and-drop CSV/TXT upload
│   │   └── OutputCard.tsx            ← Generated doc display + export
│   ├── lib/
│   │   ├── db.ts                     ← SQLite connection + table setup
│   │   ├── prompts.ts                ← AI system prompts per doc type
│   │   └── export.ts                 ← PDF and TXT export logic
│   └── types/
│       └── index.ts                  ← TypeScript types used everywhere
├── .env.local.example                ← Copy this to .env.local
├── next.config.js                    ← Next.js config
├── package.json                      ← All dependencies
└── tsconfig.json                     ← TypeScript config
```

---

## Resume bullet points to use

After building and deploying this:

> Built BriefBot, an AI-powered internal document assistant that converts raw
> notes and CSV data into polished SOPs, reports, and email drafts using the
> Claude API — reducing documentation effort by ~70%; built with Next.js,
> TypeScript, Node.js, SQLite, and deployed on Vercel.

Key numbers to mention in interviews:
- Supports 5 document types and 4 tone modes
- Auto-saves to SQLite with full CRUD dashboard
- PDF and TXT export built in
- CSV file parsing with PapaParse
- End-to-end: frontend, API routes, database, AI integration, deployment

---

## Common errors and fixes

**Error: ANTHROPIC_API_KEY is not configured**
→ You forgot to create .env.local or the key is wrong. Re-read Step 4.

**Error: Cannot find module 'better-sqlite3'**
→ Run `npm install` again. If on Windows, you may need to install build tools:
   `npm install --global windows-build-tools`

**Error: Module not found '@/components/...'**
→ Make sure you are running `npm run dev` from inside the briefbot folder.

**Port 3000 already in use**
→ Run `npm run dev -- --port 3001` to use a different port.

**PDF export does nothing**
→ Check your browser's download folder. Some browsers block auto-downloads.
   Click "Allow" if a popup appears.
