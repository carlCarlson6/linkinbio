import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignInButton, SignUpButton } from '@clerk/tanstack-react-start'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: Landing,
})

function Landing() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-stone-50 via-white to-indigo-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold tracking-tight text-stone-900">
          link<span className="text-indigo-600">in</span>bio
        </span>
        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
          <button className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500">
            Sign in
          </button>
        </SignInButton>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl">
          Every link you share,
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            on one page.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-stone-600">
          Claim your handle, add your links, pick a theme — and share a single
          URL everywhere. Track visits and clicks from your dashboard.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <button className="rounded-full bg-stone-900 px-7 py-3 text-base font-semibold text-white shadow-sm hover:bg-stone-700">
              Claim your handle
            </button>
          </SignUpButton>
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <button className="px-2 py-3 text-base font-medium text-stone-600 hover:text-stone-900">
              I already have one →
            </button>
          </SignInButton>
        </div>

        <div className="mt-20 w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 p-8 shadow-xl">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-indigo-500 text-2xl font-bold text-white">
            J
          </div>
          <p className="mt-3 text-lg font-semibold text-white">@jane</p>
          <p className="text-sm text-slate-300">Designer &amp; maker</p>
          <div className="mt-6 space-y-3">
            {['My portfolio', 'Latest video', 'Newsletter'].map((t) => (
              <div
                key={t}
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white"
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
