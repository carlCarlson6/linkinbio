import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { BioPage } from '../components/BioPage'
import { getPublicPage, trackClick } from '../server/public'

export const Route = createFileRoute('/links/$slug')({
  loader: async ({ params }) => {
    const page = await getPublicPage({ data: { slug: params.slug } })
    if (!page) throw notFound()
    return page
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.displayName || loaderData.slug} (@${loaderData.slug}) · LinkInBio`
          : 'LinkInBio',
      },
    ],
  }),
  notFoundComponent: PageNotFound,
  component: PublicBioPage,
})

function PageNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-50 px-4 text-center">
      <p className="text-2xl font-bold text-stone-900">This page doesn&apos;t exist</p>
      <p className="text-stone-600">The handle you&apos;re looking for isn&apos;t claimed yet.</p>
      <Link
        to="/"
        className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
      >
        Claim it on LinkInBio
      </Link>
    </main>
  )
}

function PublicBioPage() {
  const data = Route.useLoaderData()

  return (
    <main className="min-h-dvh">
      <BioPage
        data={data}
        onLinkClick={(linkId) => {
          // Fire-and-forget; the link opens in a new tab so this request completes.
          void trackClick({ data: { linkId } }).catch(() => {})
        }}
      />
    </main>
  )
}
