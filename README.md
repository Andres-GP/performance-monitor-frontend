# 📊 Performance Monitor – Frontend

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://performance-monitor-frontend.vercel.app/)
[![CI](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/ci.yml)
[![CD](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/cd.yml/badge.svg)](https://github.com/Andres-GP/performance-monitor-frontend/actions/workflows/cd.yml)

A modern **performance monitoring dashboard** built with **Next.js 16** and **TypeScript**. Features secure authentication, real-time data visualization, and a clean, responsive UI – designed to track and analyze key metrics effortlessly.

---

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
