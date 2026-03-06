import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="grid min-h-screen place-items-center bg-linear-to-b from-slate-50 to-slate-100 px-4 py-8 font-sans">
      <section className="w-full max-w-170 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.02em] text-slate-700">
          Linkinbio Platform
        </p>
        <h1 className="mb-3 mt-3 text-[2.1rem] leading-[1.15] text-slate-900">
          One page for all your important links
        </h1>
        <p className="mx-auto max-w-[52ch] text-base leading-relaxed text-slate-600">
          Build a personalized link page in minutes and share it everywhere.
          Keep your audience focused, your content organized, and your profile
          always up to date.
        </p>

        <div className="mt-7">
          <Link
            to="/test"
            className="inline-block rounded-[10px] bg-slate-900 px-5 py-3 font-semibold text-white no-underline"
          >
            Access platform
          </Link>
        </div>
      </section>
    </main>
  )
}