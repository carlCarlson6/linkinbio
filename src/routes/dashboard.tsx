import { useState } from 'react'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { UserButton } from '@clerk/tanstack-react-start'
import { Analytics } from '../components/Analytics'
import { BioPage, type BioPageData } from '../components/BioPage'
import { CreateLinkinbioForm } from '../components/CreateLinkinbioForm'
import { LinkManager } from '../components/LinkManager'
import { ProfileSettings, type ProfileDraft } from '../components/ProfileSettings'
import { getDashboard, type DashboardData } from '../server/dashboard'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/' })
    }
  },
  loader: () => getDashboard(),
  head: () => ({ meta: [{ title: 'Dashboard · LinkInBio' }] }),
  component: DashboardPage,
})

function DashboardPage() {
  const data = Route.useLoaderData()

  return (
    <div className="min-h-dvh bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="text-lg font-bold tracking-tight text-stone-900">
            link<span className="text-indigo-600">in</span>bio
          </Link>
          <div className="flex items-center gap-4">
            {data && (
              <a
                href={`/links/${data.page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                View my page ↗
              </a>
            )}
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {data ? <Dashboard data={data} /> : <CreateLinkinbioForm />}
      </main>
    </div>
  )
}

function Dashboard({ data }: { data: NonNullable<DashboardData> }) {
  const { page, links, analytics } = data
  const [draft, setDraft] = useState<ProfileDraft | null>(null)

  const preview: BioPageData = {
    slug: page.slug,
    displayName: draft?.displayName ?? page.displayName,
    bio: draft?.bio ?? page.bio,
    theme: draft?.theme ?? page.theme,
    buttonStyle: draft?.buttonStyle ?? page.buttonStyle,
    links: links.map((l) => ({ id: l.id, title: l.title, url: l.url })),
  }

  return (
    <div className="space-y-6">
      <ShareBar slug={page.slug} />

      <Analytics analytics={analytics} links={links} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <ProfileSettings page={page} onDraftChange={setDraft} />
          <LinkManager links={links} clicksByLink={analytics.clicksByLink} />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <p className="mb-3 text-center text-sm font-medium text-stone-500">Preview</p>
            <div className="h-[560px] overflow-y-auto rounded-[2rem] border-8 border-stone-900 shadow-xl">
              <BioPage data={preview} compact />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ShareBar({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const path = `/links/${slug}`

  async function copy() {
    const url = `${window.location.origin}${path}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — leave the URL visible for manual copy.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4">
      <p className="text-sm text-indigo-900">
        Your page is live at{' '}
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2 hover:text-indigo-700"
        >
          {path}
        </a>
      </p>
      <button
        type="button"
        onClick={copy}
        className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        {copied ? 'Copied ✓' : 'Copy URL'}
      </button>
    </div>
  )
}
