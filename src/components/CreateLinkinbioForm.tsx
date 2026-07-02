import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { SLUG_REGEX } from '../lib/slug'
import { createLinkinbio } from '../server/dashboard'

export function CreateLinkinbioForm() {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const normalized = slug.trim().toLowerCase()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (normalized.length < 3 || !SLUG_REGEX.test(normalized)) {
      setError(
        'Handles are 3-30 characters: lowercase letters, numbers and hyphens (no leading/trailing hyphen).',
      )
      return
    }
    setSaving(true)
    setError(null)
    try {
      const result = await createLinkinbio({
        data: { slug: normalized, displayName: displayName.trim() },
      })
      if (!result.ok) {
        setError(result.error)
      } else {
        await router.invalidate()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-lg">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-stone-900">Claim your handle</h1>
        <p className="mt-2 text-sm text-stone-600">
          Your handle is the public address of your page. Pick something short and memorable —
          you can&apos;t change it later.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-stone-700">
              Handle
            </label>
            <div className="mt-1.5 flex items-center overflow-hidden rounded-lg border border-stone-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
              <span className="border-r border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-500">
                /links/
              </span>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="your-handle"
                autoFocus
                maxLength={30}
                className="w-full px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-stone-700">
              Display name <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
              maxLength={50}
              className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving || normalized.length === 0}
            className="w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create my page'}
          </button>
        </form>
      </div>
    </div>
  )
}
