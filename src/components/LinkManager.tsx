import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import type { Link } from '../db/schema'
import { createLink, deleteLink, moveLink, updateLink } from '../server/links'

type Props = {
  links: Link[]
  clicksByLink: Record<string, number>
}

export function LinkManager({ links, clicksByLink }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    try {
      await action()
      await router.invalidate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Links</h2>
      <p className="mt-1 text-sm text-stone-500">
        Add the links you want to share. Drag order with the arrows.
      </p>

      <AddLinkForm busy={busy} onAdd={(data) => run(() => createLink({ data }))} />

      <ul className="mt-5 space-y-3">
        {links.length === 0 && (
          <li className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
            No links yet — add your first one above.
          </li>
        )}
        {links.map((link, index) => (
          <LinkRow
            key={link.id}
            link={link}
            clicks={clicksByLink[link.id] ?? 0}
            isFirst={index === 0}
            isLast={index === links.length - 1}
            busy={busy}
            onMove={(direction) => run(() => moveLink({ data: { id: link.id, direction } }))}
            onSave={(data) => run(() => updateLink({ data: { id: link.id, ...data } }))}
            onDelete={() => run(() => deleteLink({ data: { id: link.id } }))}
          />
        ))}
      </ul>
    </section>
  )
}

function AddLinkForm({
  busy,
  onAdd,
}: {
  busy: boolean
  onAdd: (data: { title: string; url: string }) => Promise<unknown> | void
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) {
      setError('Both a title and a URL are required.')
      return
    }
    setError(null)
    try {
      await onAdd({ title: title.trim(), url: normalizeUrl(url) })
      setTitle('')
      setUrl('')
    } catch {
      setError('Could not add the link. Check the URL and try again.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 rounded-xl bg-stone-50 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. My portfolio)"
          maxLength={80}
          aria-label="Link title"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          aria-label="Link URL"
          className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Add link
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  )
}

function LinkRow({
  link,
  clicks,
  isFirst,
  isLast,
  busy,
  onMove,
  onSave,
  onDelete,
}: {
  link: Link
  clicks: number
  isFirst: boolean
  isLast: boolean
  busy: boolean
  onMove: (direction: 'up' | 'down') => void
  onSave: (data: { title: string; url: string }) => Promise<unknown> | void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) {
      setError('Both a title and a URL are required.')
      return
    }
    setError(null)
    try {
      await onSave({ title: title.trim(), url: normalizeUrl(url) })
      setEditing(false)
    } catch {
      setError('Could not save. Check the URL and try again.')
    }
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            aria-label="Link title"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label="Link URL"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setTitle(link.title)
                setUrl(link.url)
                setError(null)
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-3 rounded-xl border border-stone-200 p-4">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => onMove('up')}
          disabled={busy || isFirst}
          aria-label={`Move ${link.title} up`}
          className="rounded px-1 text-stone-400 hover:text-stone-800 disabled:opacity-30"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMove('down')}
          disabled={busy || isLast}
          aria-label={`Move ${link.title} down`}
          className="rounded px-1 text-stone-400 hover:text-stone-800 disabled:opacity-30"
        >
          ▼
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-stone-900">{link.title}</p>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-xs text-stone-500 hover:text-indigo-600"
        >
          {link.url}
        </a>
      </div>

      <span
        title={`${clicks} clicks`}
        className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
      >
        {clicks} {clicks === 1 ? 'click' : 'clicks'}
      </span>

      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete "${link.title}"? Its click history will be removed too.`)) {
              onDelete()
            }
          }}
          disabled={busy}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </li>
  )
}

/** Prepend https:// when the protocol is missing so pasted bare domains validate. */
function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed && !/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}
