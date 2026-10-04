# Runner Up

Runner Up is India's premier GPS-verified virtual running platform, split into a Next.js frontend and an Express/Prisma backend.

## Project Structure

```text
frontend/  Next.js 16 app (Clerk Auth, Framer Motion, Tailwind CSS)
backend/   Express API server, Prisma ORM, PostgreSQL database, Clerk Verification
```

## Setup & Quickstart

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 2. Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

## Features

- **GPS Verified Races**: Complete 1.5K, 5K, 10K, 21K virtual marathons with Strava/Garmin tracking.
- **Finisher Medals & Certificates**: Automated verification, instant E-Certificates with QR verification, and real heavy metal finisher medals.
- **Live Leaderboards**: Verified finisher rankings, pace calculations, and runner achievements.

