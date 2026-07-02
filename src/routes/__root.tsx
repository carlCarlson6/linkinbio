/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from '@tanstack/react-router'
import { ClerkProvider } from '@clerk/tanstack-react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'
import appCss from '../styles.css?url'

const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()
  if (!userId) return undefined
  return { userId }
})

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await fetchClerkAuth()
    return { user }
  },
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'LinkInBio — every link, one page' },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
})

function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-50 px-4 text-center">
      <p className="text-6xl font-bold text-stone-300">404</p>
      <p className="text-stone-600">This page doesn&apos;t exist.</p>
      <Link
        to="/"
        className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
      >
        Go home
      </Link>
    </main>
  )
}

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <ClerkProvider afterSignOutUrl="/">{children}</ClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}
