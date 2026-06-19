# Deployment (Railway)

The app deploys to **Railway** with two isolated environments — **staging** and
**production** — under one Railway project. Each environment runs the same three
services plus managed data stores.

```
Railway project: formula-stats
├── environment: staging
│   ├── Frontend      (Next.js)   root: Frontend/
│   ├── Backend       (NestJS)    root: Backend/
│   ├── DataService   (FastAPI)   root: DataService/
│   ├── Postgres      (plugin)
│   ├── Redis         (plugin)
│   └── Bucket        (volume / S3-compatible storage)
└── environment: production
    └── (identical service set, separate data + secrets)
```

## One-time setup per service

In each service's **Settings → Source**, set the **Root Directory** to the
folder above (`Frontend`, `Backend`, or `DataService`). Railway reads that
folder's `railway.json` for build/start commands and auto-detects the stack
(Nixpacks). Environment variables are set **per environment** in the Railway
dashboard — never committed. The deploy commands deliberately avoid `dotenv-cli`
because Railway injects variables directly into the process.

## Environment variables

Railway exposes service references like `${{Postgres.DATABASE_URL}}` and
`${{Redis.REDIS_URL}}` — use those instead of pasting raw connection strings.

### Backend
| Variable | Value |
| --- | --- |
| `NODE_ENV` | `staging` / `production` |
| `PORT` | provided by Railway |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `JWT_ACCESS_SECRET` | 32+ char secret (unique per env) |
| `JWT_REFRESH_SECRET` | 32+ char secret (unique per env) |
| `JWT_ACCESS_TTL_SECONDS` | `900` |
| `JWT_REFRESH_TTL_DAYS` | `30` |
| `CORS_ORIGINS` | the Frontend public URL |
| `APP_WEB_URL` | the Frontend public URL |
| `RESEND_API_KEY` | from Resend |
| `MAIL_FROM` | verified sender, e.g. `Formula Stats <no-reply@your-domain>` |
| `EMAIL_VERIFICATION_TTL_MIN` | `15` |
| `PASSWORD_RESET_TTL_MIN` | `30` |
| `COOKIE_DOMAIN` | `.your-domain.com` (production, for cross-subdomain cookies) |

The Backend's start command runs `prisma migrate deploy` before booting, so
migrations are applied automatically on each release.

### Frontend
| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | the Backend public URL (e.g. `https://api-staging.your-domain.com`) |
| `PORT` | provided by Railway |

> `NEXT_PUBLIC_*` is **inlined at build time**. Changing it requires a rebuild,
> and the value must be set in the environment Railway uses for the build.

### DataService
| Variable | Value |
| --- | --- |
| `PORT` | provided by Railway |
| `FASTF1_CACHE_DIR` | a mounted volume path, e.g. `/data/fastf1-cache` |
| `CORS_ORIGINS` | the Backend public URL |
| `INTERNAL_API_KEY` | shared secret; set the same value on the Backend |

(The Backend calls the DataService server-to-server with the `X-Internal-Key`
header. Expose the DataService privately where possible.)

## Promotion flow

1. Push to a feature branch → open a PR.
2. CI runs typecheck + tests + build for all three services.
3. Merge to `main` → Railway **staging** redeploys automatically.
4. Verify staging, then **promote** the same build to **production** in Railway.

Roll back instantly by redeploying the previous deployment in the Railway UI.
