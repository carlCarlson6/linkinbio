import { createFileRoute } from '@tanstack/react-router'
import { UserButton } from '@clerk/tanstack-react-start'
import { requireAuth } from '../lib/authorization'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context: { user } }) => {
    requireAuth(user)
  },
  ssr: true,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <h1 className="m-0 text-lg font-bold tracking-wide text-slate-900">
            LINKINBIO
          </h1>
          <UserButton />
        </div>
      </header>

      <div className="px-4 py-6 text-slate-800">Hello "/dashboard"!</div>
    </main>
  )
}
