# 📊 Performance Monitor – Frontend

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://performance-monitor-frontend.vercel.app/)
[![CI](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/ci.yml)
[![CD](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/cd.yml/badge.svg)](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/cd.yml)

A modern **performance monitoring dashboard** built with **Next.js 16** and **TypeScript**. Features secure authentication, real-time data visualization, and a clean, responsive UI – designed to track and analyze key metrics effortlessly.

---

## Local configuration and data contract

The private dashboard is served by the Next.js App Router under `app/(app)`. Clerk middleware protects these pages. Browser requests to FastAPI go through `/api/proxy/*`; the client obtains a Clerk session token and sends it as a Bearer token. Keep `CLERK_SECRET_KEY`, backend credentials, and all Supabase keys server-side. Never prefix them with `NEXT_PUBLIC_`.

Copy `.env.example` to `.env.local` and set the Clerk keys and URLs. Backend selection is server-side: set `BACKEND_API_URL` to an explicit FastAPI base URL, or configure `RENDER_SERVICE_ID_PROD` and `RENDER_SERVICE_ID_STAGING` for branch-based selection (`main` uses production; `staging` and `develop` use staging). Do not set `BACKEND_API_TOKEN` in a deployed frontend; authenticated calls use the user's Clerk session token. No frontend code connects directly to Supabase.

Available private views are Overview (`/`), Strategies (`/strategies` and `/strategies/[id]`), Portfolio (`/portfolio`), Alerts (`/alerts`), Market Regime (`/market-regime`), Weekly EDA (`/weekly-review`), and Settings (`/settings`). The frontend uses the backend's existing `/strategies`, `/strategies/{id}`, `/strategies/{id}/trades`, `/strategies/{id}/equity`, `/performance/metrics/{id}`, `/alerts`, `/alerts/{id}/ack`, `/portfolios`, `/portfolios/{id}`, `/portfolios/{id}/correlation`, `/market/regime`, `/portfolio/metrics`, `/portfolio/weights`, `/capital/summary`, `/weekly/reports/latest`, and `/health` routes where supported.

Monitoring portfolio, equity, correlation, trade, and alert endpoints use paged `{ items, limit, offset, total }` responses. Strategy detail loads a bounded equity sample page and requests trade pages from FastAPI. Trades use `profit`/`pnl`, `instrument`/`symbol`, and `direction`/`side` as provided by the backend contract. Portfolio percentages are returned in percentage points and are rendered without multiplying by 100. The legacy strategy/metrics endpoints retain their existing array/object formats. Weekly EDA consumes the latest `reports/weekly/<week>/summary.json` served by the backend. The backend checkout does not include a sample summary, so report fields should remain optional and absent values must display as unavailable. The EHI is provisional analysis only and must not be treated as an execution instruction.

Run locally with `npm install` and `npm run dev`. Verification commands are `npm test -- --runInBand`, `npm run lint`, and `npm run build`. A working Clerk environment and reachable FastAPI instance are required to verify live authenticated data.

`npx tsc --noEmit` checks the TypeScript project directly, and production builds run this check by default. Next.js 16 warns that the existing root `middleware.ts` convention is deprecated; migrate it to the supported `proxy.ts` convention as a dedicated follow-up after reconciling the duplicate `app/proxy.ts` file.

The current production build configuration sets `typescript.ignoreBuildErrors: true`. A separate `npx tsc --noEmit` still reports existing type errors in legacy portfolio metrics, chart tooltip formatters, market regime components, strategy/backtest shapes, and duplicate/missing translation keys. The successful production build therefore confirms bundling and route generation, not a clean TypeScript check. Next.js 16 also warns that the existing root `middleware.ts` convention is deprecated; migrate it to the supported `proxy.ts` convention as a dedicated follow-up after reconciling the duplicate `app/proxy.ts` file.

## 🚀 Live Demo

👉 [View Live Dashboard](https://performance-monitor-frontend.vercel.app/)

---

## ✨ Features

- 🔐 **Secure Authentication** – Powered by **Clerk** with seamless sign‑in/sign‑up flows.
- 📈 **Interactive Charts** – Visualize performance data with **Recharts**.
- 🌙 **Theme Switcher** – Light/dark mode with `next-themes` and persistence.
- ⚡ **Efficient Data Fetching** – Caching and background updates via **TanStack Query**.
- 🧠 **State Management** – Global state handled cleanly with **Zustand**.
- 🧩 **Modern UI Components** – Built with **shadcn/ui** (Radix primitives) and **Tailwind CSS**.
- 📱 **Fully Responsive** – Optimized for desktop, tablet, and mobile devices.
- 🧪 **Testing** – Unit and integration tests with **Jest** and **React Testing Library**.
- 🚦 **CI/CD Pipeline** – Automated linting, testing, and Vercel deployments via GitHub Actions.

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
| **Themes**          | next-themes                                |
| **Toasts**          | Sonner                                     |
| **Analytics**       | Vercel Analytics                           |
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

---
