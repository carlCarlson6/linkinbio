# Linkinbio

Linkinbio is a web application for creating a single, shareable page that aggregates a user's important links. The current implementation includes a public landing page, Clerk-based sign-in, and a protected dashboard route for authenticated users.

## Project Overview

- Public entry route at `/` with a sign-in flow.
- Protected route at `/dashboard` that redirects unauthenticated users.
- Server middleware integration with Clerk for authentication.
- Environment variable validation for server and client configuration.

## Technologies Used

### React 19
Used to build the UI components and route views.

### TanStack Start
Provides the app runtime structure, server/client integration, and middleware pipeline.

### TanStack Router
Defines file-based routes and route guards (`beforeLoad`) for navigation and access control.

### Clerk (`@clerk/tanstack-react-start`)
Handles authentication UI (`SignInButton`, `UserButton`) and server-side auth context via middleware.

### Vite
Used as the development server and bundler (`npm run dev`, `npm run build`).

### Nitro (nightly)
Included as a Vite plugin/runtime layer via `nitro/vite`. Pinned to `3.0.1-20260227-181935-bfbb207c` for reproducible installs.

### Tailwind CSS v4
Used for utility-first styling in route components.

### TypeScript
Provides static typing across app and route code.

### Zod + `@t3-oss/env-core`
Validates required environment variables, including Clerk keys for server and client contexts.

## Scripts

- `npm run dev`: Starts local development server on port `3000`.
- `npm run build`: Builds the project for production.

## Task

- [x] `SEC-001` Resolve supply-chain drift from unpinned nightly dependency.
  Current risk: `package.json` uses `nitro: npm:nitro-nightly@latest`, which causes non-reproducible installs.

- [x] `SEC-002` Remove plaintext local secret exposure and rotate compromised keys.
  Current risk: secrets are present in `.env` and `.clerk/.tmp/keyless.json`.

- [x] `SEC-003` Introduce explicit authorization boundaries beyond signed-in checks.
  Current risk: access control is presence-based only, without role/permission checks for future sensitive features.

- [ ] `SEC-004` Enforce startup-time environment validation for auth secrets.
  Current risk: required Clerk configuration may only fail at runtime because `src/env.ts` is not imported during app startup.

## RELEASES

### security hardening and workflow updates — 2026-04-04
PR: https://github.com/carlCarlson6/linkinbio/pull/6
This release delivers dependency, secret-management, and authorization hardening alongside workflow updates for security reviews and task execution.