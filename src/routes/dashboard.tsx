import { createFileRoute, useRouter } from '@tanstack/react-router'
import { UserButton } from '@clerk/tanstack-react-start'
import { requireAuth } from '../lib/authorization'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { db } from '../db'
import { linkinbios } from '../db/schema'
import { asc, eq } from 'drizzle-orm'
import { useState } from 'react'
import z from 'zod'

const slugSchema = z.object({
  slug: z
    .string()
    .min(1, 'Please enter a slug')
    .regex(
      /^[a-z0-9_-]+$/,
      'Use only lowercase letters, numbers, hyphens, and underscores',
    ),
})

function getFriendlySlugError(err: unknown) {
  if (Array.isArray(err)) {
    const firstIssue = err.find(
      (issue): issue is { message?: string } =>
        typeof issue === 'object' && issue !== null,
    )

    if (typeof firstIssue?.message === 'string') {
      return firstIssue.message
    }
  }

  if (err instanceof z.ZodError) {
    return err.issues[0]?.message ?? 'Please enter a valid slug'
  }

  const message = err instanceof Error ? err.message : String(err)

  if (
    message.includes('invalid_format') ||
    message.includes('Slug may only contain')
  ) {
    return 'Use only lowercase letters, numbers, hyphens, and underscores'
  }

  return message
}

const getLinkinbios = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth();
  if (!userId) return [];
  return db
    .select()
    .from(linkinbios)
    .where(eq(linkinbios.userId, userId))
    .orderBy(asc(linkinbios.slug));
});

const createLinkinbio = createServerFn({ method: 'POST' })
  .inputValidator(slugSchema)
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');
    await db.insert(linkinbios).values({ userId, slug: data.slug });
  });

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context: { user } }) => {
    requireAuth(user)
  },
  loader: () => getLinkinbios(),
  ssr: true,
  component: RouteComponent,
})

function RouteComponent() {
  const items = Route.useLoaderData();
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = slug.trim().toLowerCase().replace(/^@+/, '');
    const validation = slugSchema.safeParse({ slug: normalized });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Please enter a valid slug');
      return;
    }

    setPending(true);
    try {
      await createLinkinbio({ data: { slug: normalized } });
      setSlug('');
      await router.invalidate();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      setError(
        code === '23505'
          ? 'That slug is already taken'
          : getFriendlySlugError(err),
      );
    } finally {
      setPending(false);
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
        <h2 className="mb-6 text-2xl font-semibold">Your Link-in-bio pages</h2>

        <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3">
          <label htmlFor="slug" className="text-sm font-medium text-slate-700">
            Create a new page
          </label>
          <div className="flex gap-2">
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="@your-slug"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {pending ? 'Creating…' : 'Create'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        {items.length === 0 ? (
          <p className="text-slate-500">No pages yet. Create your first one above!</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map(item => (
              <li key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="font-medium text-slate-800">@{item.slug}</span>
                <a
                  href={`/@${item.slug}`}
                  className="text-sm text-slate-500 hover:text-slate-900 hover:underline"
                >
                  View page →
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

