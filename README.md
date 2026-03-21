# 🎓 Sensei — AI Career Coach

A full-stack AI-powered career coaching SaaS built with Next.js 15, Tailwind CSS, ShadCN UI, Clerk, Gemini AI, and Prisma.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏭 Industry Insights | Real-time market data, salary trends, skill demand — updated weekly via Inngest cron |
| 📄 Resume Builder | ATS-optimized resume with Gemini AI "Improve with AI" button, markdown preview, PDF export |
| 🎯 Interview Prep | 10 role-specific questions, performance charts, AI improvement tips |
| ✉️ Cover Letter Generator | Paste a job description → get a tailored cover letter instantly |
| 🔐 Authentication | Clerk (Google + email/password), full user management |
| 🌙 Dark Mode | next-themes dark/light mode toggle |

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, ShadCN UI
- **Auth**: Clerk
- **AI**: Google Gemini 1.5 Flash
- **Database**: PostgreSQL + Prisma ORM
- **Background Jobs**: Inngest (weekly cron for industry data)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd sensei
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL=postgresql://...

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...   # from Clerk dashboard > Webhooks

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=AIza...

INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

### 3. Set up database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Set up Clerk Webhook

In your Clerk dashboard:
1. Go to **Webhooks** → **Add Endpoint**
2. URL: `https://your-domain.com/api/webhook/clerk`
3. Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET`

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
sensei/
├── app/
│   ├── (auth)/              # Clerk sign-in / sign-up pages
│   ├── (main)/              # Protected app pages
│   │   ├── dashboard/       # Industry insights + salary charts
│   │   ├── resume/          # Resume builder
│   │   ├── interview/       # Mock interview prep
│   │   └── ai-cover-letter/ # Cover letter generator
│   ├── onboarding/          # User onboarding flow
│   └── api/
│       ├── inngest/         # Background job handler
│       └── webhook/clerk/   # Clerk user sync webhook
├── actions/                 # Next.js Server Actions
│   ├── user.js
│   ├── dashboard.js
│   ├── resume.js
│   ├── interview.js
│   └── cover-letter.js
├── components/
│   ├── header.jsx
│   ├── theme-provider.jsx
│   └── ui/                  # ShadCN UI components
├── lib/
│   ├── prisma.js            # Prisma client singleton
│   ├── gemini.js            # Gemini AI helper
│   ├── inngest.js           # Inngest client + cron job
│   └── utils.js
└── prisma/
    └── schema.prisma        # Database models
```

---

## 📊 Database Models

- **User** — Clerk user synced via webhook, stores industry/skills/bio
- **IndustryInsight** — Industry data refreshed weekly by cron job
- **Resume** — Markdown resume content per user
- **Assessment** — Quiz results with AI improvement tips
- **CoverLetter** — Generated cover letters per user

---

## 🔧 ShadCN UI Components to Install

```bash
npx shadcn@latest add accordion alert-dialog badge button card dialog dropdown-menu input label progress radio-group select sonner tabs textarea
```

---

## 🎯 Assignments (from the course)

1. Add a **skills gap analyzer** comparing user skills to industry top skills
2. Add **resume ATS scoring** using Gemini
3. Add a **job search tracker** to track applications
4. Implement **email notifications** when industry data updates
