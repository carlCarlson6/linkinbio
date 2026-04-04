import { createFileRoute, useRouter } from '@tanstack/react-router'
import { UserButton } from '@clerk/tanstack-react-start'
import { requireAuth } from '../lib/authorization'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { db } from '../db'
import { linkinbios } from '../db/schema'
import { asc, eq, and } from 'drizzle-orm'
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

function getErrorReason(err: unknown) {
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

function formatErrorMessage(err: unknown) {
  const code = (err as { code?: string })?.code

  if (code === '23505') {
    return 'Invalid input: That slug is already taken'
  }

  if (Array.isArray(err) || err instanceof z.ZodError) {
    return `Invalid input: ${getErrorReason(err)}`
  }

  const reason = getErrorReason(err)

  if (
    reason.includes('invalid_format') ||
    reason.includes('Please enter a') ||
    reason.includes('Use only lowercase')
  ) {
    return `Invalid input: ${reason}`
  }

  return `Server error: ${reason}`
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

const deleteLinkinbio = createServerFn({ method: 'POST' })
  .inputValidator(slugSchema)
  .handler(async ({ data }) => {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');
    await db
      .delete(linkinbios)
      .where(and(eq(linkinbios.slug, data.slug), eq(linkinbios.userId, userId)));
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

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = slug.trim().toLowerCase().replace(/^@+/, '');
    const validation = slugSchema.safeParse({ slug: normalized });

    if (!validation.success) {
      setError(formatErrorMessage(validation.error));
      return;
    }

    setPending(true);
    try {
      await createLinkinbio({ data: { slug: normalized } });
      setSlug('');
      await router.invalidate();
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  function openDeleteModal(itemSlug: string) {
    setDeleteTarget(itemSlug);
    setDeleteConfirm('');
    setDeleteError(null);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
    setDeleteConfirm('');
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    if (deleteConfirm !== deleteTarget) {
      setDeleteError('The name you entered does not match. Please try again.');
      return;
    }
    setDeletePending(true);
    setDeleteError(null);
    try {
      await deleteLinkinbio({ data: { slug: deleteTarget } });
      closeDeleteModal();
      await router.invalidate();
    } catch (err: unknown) {
      setDeleteError(formatErrorMessage(err));
    } finally {
      setDeletePending(false);
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
          {error && (
            <p
              className={`text-sm ${error.startsWith('Invalid input:') ? 'text-amber-600' : 'text-red-600'}`}
            >
              {error}
            </p>
          )}
        </form>

        {items.length === 0 ? (
          <p className="text-slate-500">No pages yet. Create your first one above!</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map(item => (
              <li key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="font-medium text-slate-800">@{item.slug}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDeleteModal(item.slug)}
                    aria-label={`Delete @${item.slug}`}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                  <a
                    href={`/@${item.slug}`}
                    className="text-sm text-slate-500 hover:text-slate-900 hover:underline"
                  >
                    View page →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deleteTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h3 id="delete-dialog-title" className="text-lg font-semibold text-slate-900">Delete @{deleteTarget}?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This action cannot be undone. To confirm, type{' '}
              <span className="font-semibold text-slate-800">{deleteTarget}</span> below.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={deleteTarget}
              aria-label={`Type ${deleteTarget} to confirm deletion`}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            {deleteError && (
              <p className="mt-2 text-sm text-red-600">{deleteError}</p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deletePending}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deletePending || deleteConfirm !== deleteTarget}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletePending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

