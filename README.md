# linkinbio

A link-in-bio aggregator (Linktree-style). Users sign in, claim a unique handle, add links,
customize their page's look, and share it at `/links/<handle>`. The dashboard shows page
views and per-link click analytics.

## Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework (Vite + Nitro)
- [Clerk](https://clerk.com) — authentication
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL on [Neon](https://neon.tech)
- Tailwind CSS v4
- Deployed on [Vercel](https://vercel.com)

## Setup

1. **Install dependencies**

   ```sh
   npm install
   ```

2. **Environment variables** — copy `.env.example` to `.env` and fill in:

   | Variable | Where to get it |
   |---|---|
   | `VITE_CLERK_PUBLISHABLE_KEY` | [Clerk dashboard → API keys](https://dashboard.clerk.com/last-active?path=api-keys) |
   | `CLERK_SECRET_KEY` | Same page |
   | `DATABASE_URL` | [Neon console](https://console.neon.tech) — use the pooled connection string |

3. **Create the database schema**

   ```sh
   npm run db:migrate
   ```

4. **Run the dev server**

   ```sh
   npm run dev
   ```

   The app runs at http://localhost:3000.

## How it works

| Route | What it does |
|---|---|
| `/` | Landing page; signed-in users are redirected to `/dashboard` |
| `/dashboard` | Protected. First visit prompts to claim a handle; afterwards it's the management panel: appearance (name, bio, theme, button shape), link CRUD with reordering, live preview, and analytics |
| `/links/<handle>` | Public bio page. Each visit records a page view; each link click records a click (fire-and-forget, links open in a new tab) |

- Server logic lives in **server functions** (`src/server/*`), all auth-checked with Clerk's
  `auth()` via the request middleware in `src/start.ts`.
- Schema is in `src/db/schema.ts`: `linkinbios` (one per user), `links`, `page_views`,
  `link_clicks`. Migrations are generated with `npm run db:generate` into `drizzle/`.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Set the three environment variables from `.env.example` in the Vercel project settings.
3. The Nitro Vite plugin auto-detects Vercel at build time — no extra config needed.
4. Run migrations against the production Neon database: `npm run db:migrate` (with the
   production `DATABASE_URL` in your environment).

In production Clerk needs a production instance (pk_live/sk_live keys) with your Vercel
domain configured in the Clerk dashboard.
