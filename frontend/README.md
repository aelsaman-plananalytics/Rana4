# Rana4 Frontend

Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Axios + Lucide icons.

## Setup

1. Install dependencies:
   ```bash
   cd frontend && npm install
   ```

2. Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to your backend (default `http://localhost:3000`).

3. Run the backend (from repo root): `npm run dev`.

4. Run the frontend:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3001](http://localhost:3001) (Next.js defaults to 3001 if 3000 is in use) or [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint

## Structure

- `app/` — App Router pages (landing, login, signup, app dashboard, standards, fragnets, activities, deliverables, export, settings, help)
- `contexts/` — Auth context (user, login, logout, register)
- `components/layout/` — Sidebar, Header, AppLayout
- `components/ui/` — shadcn-style components (Button, Card, Input, Table, Dialog)
- `lib/api.ts` — Axios client, auth API, standards/fragnets/activities/deliverables APIs
- `lib/utils.ts` — `cn()` for class names

## Settings page

The **Settings** page (e.g. `/settings` when signed in) has two main areas:

- **System** — Shows the frontend version (e.g. Rana4 Frontend v0.1.0) and the **Backend URL** the app uses for API requests (e.g. `http://localhost:3000`). Read-only; useful to confirm which backend the frontend is talking to.
- **Integrations** — Placeholder for future third-party integrations (e.g. email, payments, analytics). No integrations are configured there yet.

Account (email, display name, change password) and theme (light/dark) are in the Account and Appearance sections on the same page.

## Implemented

- **Auth** — Sign up, sign in, sign out; protected `/app` and `/settings`; JWT in localStorage; account settings (display name, change password).
- **Standards** — Full CRUD: list, create (modal), edit (modal), delete; loading and toasts.
- **Fragnets, Activities, Deliverables, Export** — CRUD and export wired to backend.
- **Dashboard, Help, Settings** — Dashboard with quick links; Help accordion; Settings (theme, account, system info, integrations placeholder).
