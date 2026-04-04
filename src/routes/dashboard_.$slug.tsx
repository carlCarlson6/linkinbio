import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router'
import { UserButton } from '@clerk/tanstack-react-start'
import { requireAuth } from '../lib/authorization'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { db } from '../db'
import { links, linkinbios } from '../db/schema'
import { asc, eq } from 'drizzle-orm'
import { useState } from 'react'
import { z } from 'zod'

const safeUrlSchema = z.string().transform((value, ctx) => {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(value)
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please enter a valid URL',
    })
    return z.NEVER
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please enter a valid HTTP or HTTPS URL',
    })
    return z.NEVER
  }

  return parsedUrl.href
})

const linkInputSchema = z.object({
  linkinbioId: z.string().uuid(),
  title: z.string().min(1, 'Please enter a title'),
  url: safeUrlSchema,
})

const getLinkinbioPanel = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => z.string().min(1).parse(slug))
  .handler(async ({ data: slug }) => {
    const { userId } = await auth()
    if (!userId) return null

    const [page] = await db
      .select()
      .from(linkinbios)
      .where(eq(linkinbios.slug, slug))
      .limit(1)

    if (!page || page.userId !== userId) return null

    const pageLinks = await db
      .select()
      .from(links)
      .where(eq(links.linkinbioId, page.id))
      .orderBy(asc(links.order), asc(links.createdAt))

    return { page, links: pageLinks }
  })

const addLink = createServerFn({ method: 'POST' })
  .inputValidator(linkInputSchema)
  .handler(async ({ data }) => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const [page] = await db
      .select()
      .from(linkinbios)
      .where(eq(linkinbios.id, data.linkinbioId))
      .limit(1)

    if (!page || page.userId !== userId) throw new Error('Forbidden')

    await db.insert(links).values({
      linkinbioId: data.linkinbioId,
      title: data.title,
      url: data.url,
    })
  })

const deleteLink = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ data: id }) => {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const [link] = await db
      .select({ id: links.id, linkinbioId: links.linkinbioId })
      .from(links)
      .where(eq(links.id, id))
      .limit(1)

    if (!link) throw new Error('Not found')

    const [page] = await db
      .select({ userId: linkinbios.userId })
      .from(linkinbios)
      .where(eq(linkinbios.id, link.linkinbioId))
      .limit(1)

    if (!page || page.userId !== userId) throw new Error('Forbidden')

    await db.delete(links).where(eq(links.id, id))
  })

export const Route = createFileRoute('/dashboard_/$slug')({
  beforeLoad: ({ context: { user } }) => {
    requireAuth(user)
  },
  loader: async ({ params }) => {
    const data = await getLinkinbioPanel({ data: params.slug })
    if (!data) throw notFound()
    return data
  },
  notFoundComponent: NotFoundPage,
  ssr: true,
  component: RouteComponent,
})

function RouteComponent() {
  const { page, links: pageLinks } = Route.useLoaderData()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validation = linkInputSchema.safeParse({
      linkinbioId: page.id,
      title: title.trim(),
      url: url.trim(),
    })

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Invalid input')
      return
    }

    setPending(true)
    try {
      await addLink({ data: validation.data })
      setTitle('')
      setUrl('')
      await router.invalidate()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPending(false)
    }
  }

  async function handleDeleteLink(id: string) {
    try {
      await deleteLink({ data: id })
      await router.invalidate()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

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

      <div className="mx-auto max-w-2xl px-4 py-8 text-slate-800">
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-900 hover:underline"
          >
            ← Dashboard
          </Link>
          <h2 className="text-2xl font-semibold">@{page.slug}</h2>
        </div>

        <form onSubmit={handleAddLink} className="mb-8 flex flex-col gap-3">
          <p className="text-sm font-medium text-slate-700">Add a new link</p>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {pending ? 'Adding…' : 'Add'}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </form>

        {pageLinks.length === 0 ? (
          <p className="text-slate-500">No links yet. Add your first one above!</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pageLinks.map(link => (
              <li
                key={link.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <span className="font-medium text-slate-800 truncate">{link.title}</span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm text-slate-500 hover:text-slate-900 hover:underline"
                  >
                    {link.url}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLink(link.id)}
                  className="ml-4 shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="text-center">
        <p className="text-6xl font-bold text-slate-300">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-800">Page not found</h1>
        <p className="mt-2 text-slate-500">
          That linkinbio page doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Back to Dashboard
        </Link>
      </section>
    </main>
  )
}
