# AI-Powered Banking & Finance Dashboard

A full-stack personal finance platform where you don't just log your money — you can actually *ask* it questions. Track income, expenses, and savings, then have an AI agent reason over your real numbers to answer things like "can I afford a trip to Goa?" or "how much did I actually spend on travel this month?" — grounded in your real data, not guesses.

**Live demo:**
- Frontend: [ai-powered-banking-finance-dashboar-gamma.vercel.app](https://ai-powered-banking-finance-dashboar-gamma.vercel.app/login)
- Backend API: [ai-powered-banking-finance-dashboard.onrender.com](https://ai-powered-banking-finance-dashboard.onrender.com/)

> Heads up: the backend runs on a free Render instance, so it spins down after 15 minutes of inactivity. If the first request feels slow, that's just it waking up — give it 30-60 seconds and it'll be snappy after that.

---

## What's inside

**Core finance tracking**
- Log income, expenses, and savings as separate, clearly typed entries
- Mark entries as one-time or recurring monthly, so rent, salary, and SIPs don't need re-entering every month
- Create your own categories on the fly, right from the entry form

**Budgets that actually tell you something**
- Set monthly limits per expense category
- Real-time spent-vs-limit progress bars, with a clear "over budget by ₹X" callout when you've blown past it
- One-click handoff to the AI assistant for personalized advice on a specific over-budget category

**An AI agent that's grounded, not guessing**
- Ask natural-language questions about your finances — the agent calls real tools against your real database rather than hallucinating numbers
- 7 function-calling tools: transaction retrieval, budget status, affordability projection, spending trend analysis, budget creation, anomaly detection, and semantic search
- **Semantic search, powered by pgvector** — ask about "travel spending" or "Goa stuff" and it finds the right entries by meaning, even if you never tagged them that way
- Full conversation memory across a chat session

**Analytics that don't put you to sleep**
- Monthly income/expense/savings/net-balance overview
- Income vs. expense trend line across recent months
- Category breakdown — separately for expenses, income, and savings
- Burn rate: how many days of runway you have left this month at your current pace, bounded sensibly by the actual calendar

**Built with real security and engineering practices, not shortcuts**
- JWT access + refresh token authentication, with silent token refresh so a page reload doesn't log you out
- Passwords hashed with bcrypt, never stored in plain text
- Every request scoped strictly to the logged-in user — no user can touch another user's data, even by guessing an ID
- CI pipeline (GitHub Actions) running lint, migrations against a real pgvector-enabled Postgres instance, and tests on every push

---

## Tech stack

| Layer | Tech |
|---|---|
| Backend | FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL + pgvector (hosted on Neon) |
| AI | Google Gemini API — native function-calling |
| Frontend | React, TypeScript, Redux Toolkit, Tailwind CSS, Recharts |
| Auth | JWT (access + refresh), bcrypt |
| Deployment | Render (backend), Vercel (frontend), Neon (database) |
| CI/CD | GitHub Actions |

---

## Getting started locally

### Prerequisites
- Python 3.11+
- Node.js 20+
- A PostgreSQL database with the `vector` extension available ( [Neon](https://neon.tech) project works great, or run Postgres locally via `pgvector/pgvector:pg18` on Docker)
- A [Gemini API key](https://ai.google.dev/)

### 1. Clone the repo

```bash
git clone https://github.com/drishtibothra/ai-powered-banking-finance-dashboard.git
cd ai-powered-banking-finance-dashboard
```

### 2. Backend setup

```bash
cd backend
python -m venv myenv
source myenv/bin/activate   # on Windows: myenv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET_KEY=some-long-random-string
GEMINI_API_KEY=your-gemini-api-key
ALLOWED_ORIGINS=http://localhost:5173
```

Run migrations, then start the server:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

The API will be live at `http://127.0.0.1:8000`, with interactive docs at `http://127.0.0.1:8000/docs`.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Then run:

```bash
npm run dev
```

The app will be live at `http://localhost:5173`.

---
