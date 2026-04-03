# ✦ BriefBot — Turn messy notes into polished documents in seconds

🔗 **[Open BriefBot →](https://briefbot-git-master-disharathore555-gmailcoms-projects.vercel.app)**

---

## What is it?

BriefBot is an AI-powered internal tool that takes your rough notes, meeting minutes, or raw text — and turns them into clean, professional documents instantly.

No formatting. No rewriting. No back and forth.
Just paste your notes and get a document that's ready to send.

---

## What can it generate?

| Type | Best for |
|---|---|
| **SOP** | Process documentation, onboarding steps, operational guides |
| **Report** | Weekly updates, business reviews, findings summaries |
| **Email** | Drafting team emails, vendor communication, follow-ups |
| **Summary** | Meeting recaps, decision logs, quick briefings |
| **Checklist** | Launch checklists, closing procedures, task tracking |

---

## How to use it — 3 steps

**1. Paste your notes**
Drop in anything — bullet points, voice note transcript, meeting scribbles. The messier the better.

**2. Pick your type and tone**
Choose what you need (SOP, Report, Email, etc.) and how it should sound:
- **Professional** — formal, corporate-ready
- **Friendly** — warm, conversational
- **Concise** — short and punchy, bullets only
- **Detailed** — thorough, with full explanations

**3. Get your document**
Click Generate. Your document appears in seconds — formatted, structured, and ready to copy, download as PDF, or save.

---

## What do you actually save?

| Without BriefBot | With BriefBot |
|---|---|
| 45 min writing an SOP from scratch | 30 seconds |
| Rewriting the same email 3 times to get the tone right | Pick a tone, done |
| Formatting a report manually in Word | PDF downloaded instantly |
| Searching for a document you made last week | Find it in History or My Docs in 2 seconds |

---

## Everything inside the app

- **Generate** — the main page, where you create documents
- **My Documents** — every document you've made, searchable and filterable
- **History** — a timeline of everything you've generated, by date
- **Analytics** — see which document types and tones you use most
- **Templates** — 9 ready-made starters (just click and generate)
- **Settings** — set your default type, tone, and preferences

---

## Templates included

Don't know where to start? Use a template:
- Employee Onboarding SOP
- Customer Returns SOP
- Kiosk Opening Checklist
- Weekly Sales Report
- Platform Performance Report
- Influencer Collaboration Email
- Vendor Delay Response Email
- Meeting Summary
- Product Launch Summary

Click any template → it pre-fills everything → hit Generate.

---

## Run it locally

```bash
git clone https://github.com/disharathore/briefbot
cd briefbot
npm install
```

Create `.env.local`:
```
GROQ_API_KEY=your_key_here     # free at console.groq.com
DATABASE_URL=your_neon_url     # free at neon.tech
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Built with

Next.js 15 · TypeScript · React · Groq AI · Neon PostgreSQL · jsPDF · Vercel

---

*Built by Disha Rathore · 2026*
