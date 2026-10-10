# Railway deploy (RunnerUp API)

## Service settings

In Railway → **runnerup** service → **Settings**:

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Build Command** | (leave empty — uses `railway.toml` / `npm run build`) |
| **Start Command** | (leave empty — uses `npm run start`) |

If Root Directory is the repo root, Railway builds the Next.js frontend instead of the API and `/health` will never respond.

## Required environment variables

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | Yes — PostgreSQL connection string (Railway Postgres plugin) |
| `CLERK_SECRET_KEY` | Yes — `sk_test_...` or `sk_live_...` |
| `FRONTEND_URL` | Yes — e.g. `https://runnerup.in,https://www.runnerup.in` |
| `NODE_ENV` | `production` |
| `ADMIN_EMAILS` | Your admin email(s), comma-separated |
| `ADMIN_BOOTSTRAP` | `false` in production |
| `RAZORPAY_KEY_ID` | For payments |
| `RAZORPAY_KEY_SECRET` | For payments |
| `RESEND_API_KEY` | For emails |

`PORT` is set automatically by Railway — do not override it.

## Verify

After deploy:

```text
GET https://runnerup-production-c2c6.up.railway.app/health
```

Expected:

```json
{ "status": "ok", "service": "runnerup-api" }
```

## Common failures

- **Application failed to respond** — usually `prisma generate` did not run (fixed in build script) or Root Directory is wrong.
- **Migrate deploy failed** — `DATABASE_URL` missing or Postgres not linked to the service.
- **502 after start** — check Deploy Logs for crash stack traces.
