// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  redirect,
} from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { ClerkProvider } from '@clerk/tanstack-react-start'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'

const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId, orgRole, orgPermissions } = await auth();
  if (!userId) return undefined;
  return { userId, orgRole: orgRole ?? null, orgPermissions: orgPermissions ?? [] };
});

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await fetchClerkAuth();
    return { user };
  },
  notFoundComponent: () => { throw redirect({ to: '/' }) },
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}