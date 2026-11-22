# 📊 Performance Monitor – Frontend

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://performance-monitor-frontend.vercel.app/)
[![CI](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/ci.yml)
[![CD](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/cd.yml/badge.svg)](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/cd.yml)

A modern **performance monitoring dashboard** built with **Next.js 16** and **TypeScript**. Features secure authentication, real-time data visualization, and a clean, responsive UI – designed to track and analyze key metrics effortlessly.

---

## Local configuration and data contract

The private dashboard is served by the Next.js App Router under `app/(app)`. Clerk's root `proxy.ts` protects these pages. Browser requests to FastAPI go through `/api/proxy/*`; the client obtains a Clerk session token and sends it as a Bearer token. The server-side proxy allows only the read, alert acknowledgement, and portfolio weight routes used by the UI. Keep `CLERK_SECRET_KEY`, backend credentials, and all Supabase keys server-side. Never prefix them with `NEXT_PUBLIC_`.

Copy `.env.example` to `.env.local` and set the Clerk keys and URLs. In Vercel, configure `BACKEND_API_URL` in Project Settings → Environment Variables: Production is `https://performance-monitor-backend-prod.onrender.com`; Preview is `https://performance-monitor-backend-staging.onrender.com`. Alternatively, set `RENDER_SERVICE_ID_PROD` and `RENDER_SERVICE_ID_STAGING` for branch-based selection (`main` uses production; `staging` and `develop` use staging). Branch detection supports Vercel's `VERCEL_GIT_COMMIT_REF` and GitHub Actions' `GITHUB_REF_NAME`. If no backend URL or matching service ID is configured, the proxy returns a backend configuration error; it never silently targets production. No static backend API key is needed; authenticated calls use the user's Clerk session token. No frontend code connects directly to Supabase.

Available private views are Portfolio (`/portfolio`), Alerts (`/alerts`), and Weekly EDA (`/weekly-review`). `/` redirects to Portfolio; the standalone Strategies pages have been removed. The frontend uses `/strategies` to populate the alert filter, plus `/alerts`, `/alerts/{id}/ack`, `/portfolios`, `/portfolios/{id}`, `/portfolios/{id}/correlation`, `/portfolio/metrics`, `/portfolio/weights`, `/capital/summary`, `/weekly/reports/latest`, and `/health`. Strategy equity, trade-history, and individual metrics routes remain in the backend but are not currently surfaced in the app.

Monitoring equity, correlation, trade, and alert endpoints use paged `{ items, limit, offset, total }` responses. Portfolio index/detail and legacy strategy/metrics endpoints retain their existing object/array formats. Strategy detail loads a bounded equity sample page and requests trade pages from FastAPI. Trades use `profit`/`pnl`, `instrument`/`symbol`, and `direction`/`side` as provided by the backend contract. Portfolio percentages are returned in percentage points and are rendered without multiplying by 100. Weekly EDA consumes the latest `reports/weekly/<week>/summary.json` served by the backend. No sample summary is present in the checked-out backend, so report fields remain optional and absent values display as unavailable. The EHI is provisional analysis only and must not be treated as an execution instruction.

Alerts send supported status, severity, time range, limit, and offset filters to FastAPI. The backend does not accept a strategy filter, so that one is applied locally to a bounded 1,000-alert page and the UI says when the API reports additional records.

Run locally with `npm install` and `npm run dev`. Verification commands are `npm test -- --runInBand`, `npm run lint`, and `npm run build`. A working Clerk environment and reachable FastAPI instance are required to verify live authenticated data.

Before pushing from a local clone, run `sh scripts/install-git-hooks.sh`. The pre-push hook requires the full Jest suite, TypeScript, ESLint, and production build to pass. GitHub Actions runs the same checks on pushes and pull requests; the `build-and-test` check is required on `develop`, `staging`, and `main`.

`npx tsc --noEmit` checks the TypeScript project directly, and the production build runs this check by default. The root `proxy.ts` uses Next.js 16's supported convention and protects private routes with Clerk. Current verification passes tests, lint, TypeScript, and production build.

## 🚀 Live Demo

👉 [View Live Dashboard](https://performance-monitor-frontend.vercel.app/)

---

## ✨ Included monitoring workflows

- Clerk-authenticated access to strategies, portfolio, alerts, market regime, and weekly review.
- A consistent forest-green and lime interface with responsive navigation and readable data cards.
- Backend status and freshness reporting, explicit missing-data states, and retry controls.
- Read-only monitoring charts plus the backend-supported alert acknowledgement and portfolio weight update actions.

---

## 🧰 Tech Stack

| Category            | Technology                                 |
| ------------------- | ------------------------------------------ |
| **Framework**       | Next.js 16                                 |
| **Language**        | TypeScript                                 |
| **Styling**         | Tailwind CSS 4, tailwind-merge, CVA        |
| **UI Components**   | shadcn/ui (Radix primitives), Lucide Icons |
| **Authentication**  | Clerk                                      |
| **Data Fetching**   | TanStack Query                             |
| **State**           | Zustand                                    |
| **Charts**          | Recharts                                   |
| **Toasts**          | Sonner                                     |
| **Testing**         | Jest + React Testing Library               |
| **Package Manager** | npm (with pnpm overrides)                  |

---

## ⚙️ CI/CD & Automation

This project includes a complete GitHub Actions workflow for continuous integration and deployment:

- **Continuous Integration (CI)**
  - Triggers on `push` and `pull_request` to `develop`, `staging`, and `main`.
  - Runs **ESLint** to enforce code quality.
  - Executes the **Jest** test suite.
  - Verifies the production build with `next build`.

- **Continuous Deployment (CD)**
  - Automatic deployment to **Vercel** after CI succeeds.
  - Deploys to a preview environment for `develop` and `staging` branches.
  - Deploys to **production** for the `main` branch.
  - Uses environment secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) for secure deployments.
  - Checks that these three GitHub Actions secrets are present, then validates token access by deploying to the configured project with the pinned CLI. Never commit the token.

---
