# Formula Stats

Full-stack Formula 1 statistics application.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (App Router) + Tailwind v4 + TanStack Query + Zustand |
| Backend | NestJS + Prisma + PostgreSQL + Redis |
| Data source | Python (FastAPI) wrapping [FastF1](https://theoehrly-fast-f1.mintlify.app/) |
| Auth | Self-hosted JWT (argon2id-hashed passwords) + rotating refresh tokens |
| Email | Resend (verification codes + password reset) |
| Hosting | Railway (staging + production) |

## Repository layout

```
/
├── Backend/      # NestJS API
├── Frontend/     # Next.js app
├── DataService/  # Python FastF1 microservice
└── .claude/      # Engineering standards
```

## Local development

Each app has its own `env/.env.example`. Copy it to `env/.env` and fill in values.

```bash
# Backend
cd Backend && npm install && npx prisma migrate dev && npm run start:dev

# Frontend
cd Frontend && npm install && npm run dev

# DataService
cd DataService && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## Deployment

Railway hosts two environments — **staging** and **production** — each with PostgreSQL,
Redis, and an object-storage bucket. See `DEPLOYMENT.md`.
