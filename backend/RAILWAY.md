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

| Variable | Required | Value / Details |
|----------|----------|-----------------|
| `DATABASE_URL` | Yes | Neon DB pooler connection string (from `backend/.env`) |
| `DIRECT_URL` | Yes | Direct Neon DB connection string (from `backend/.env`) |
| `CLERK_SECRET_KEY` | Yes | Production Clerk secret key (from `backend/.env`) |
| `CLERK_PUBLISHABLE_KEY` | Yes | Production Clerk publishable key (from `backend/.env`) |
| `FRONTEND_URL` | Yes | `https://runnerup.in,https://www.runnerup.in` |
| `NODE_ENV` | Yes | `production` |
| `ADMIN_EMAILS` | Yes | `sourav06556@gmail.com,realblack009@gmail.com` |
| `ADMIN_EMERGENCY_KEY` | Yes | Master admin emergency key (from `backend/.env`) |
| `ADMIN_BOOTSTRAP` | Yes | `false` |
| `RAZORPAY_KEY_ID` | Yes | Live Razorpay Key ID (from `backend/.env`) |
| `RAZORPAY_KEY_SECRET` | Yes | Live Razorpay Secret (from `backend/.env`) |
| `RESEND_API_KEY` | Yes | Resend API key (from `backend/.env`) |
| `RESEND_FROM_EMAIL` | Yes | `Runner Up <onboarding@resend.dev>` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name (from `backend/.env`) |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key (from `backend/.env`) |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret (from `backend/.env`) |
| `CERTIFICATE_AUTO_SEND` | Yes | `true` |

`PORT` is set automatically by Railway — do not override it.

## Verify

After deploy:

```text
GET https://mountainrun-production-c2c6.up.railway.app/health
```

Expected:

```json
{ "status": "ok", "service": "runnerup-api" }
```

## Common failures

- **Application failed to respond** — usually `prisma generate` did not run (fixed in build script) or Root Directory is wrong.
- **Migrate deploy failed** — `DATABASE_URL` missing or Postgres not linked to the service.
- **502 after start** — check Deploy Logs for crash stack traces.
