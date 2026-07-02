import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import type { Linkinbio } from '../db/schema'
import {
  BUTTON_STYLES,
  BUTTON_STYLE_IDS,
  THEMES,
  THEME_IDS,
  type ButtonStyleId,
  type ThemeId,
} from '../lib/themes'
import { updatePage } from '../server/dashboard'

export type ProfileDraft = {
  displayName: string
  bio: string
  theme: ThemeId
  buttonStyle: ButtonStyleId
}

type Props = {
  page: Linkinbio
  onDraftChange: (draft: ProfileDraft) => void
}

export function ProfileSettings({ page, onDraftChange }: Props) {
  const router = useRouter()
  const [draft, setDraftState] = useState<ProfileDraft>({
    displayName: page.displayName,
    bio: page.bio,
    theme: (THEME_IDS as readonly string[]).includes(page.theme)
      ? (page.theme as ThemeId)
      : 'midnight',
    buttonStyle: (BUTTON_STYLE_IDS as readonly string[]).includes(page.buttonStyle)
      ? (page.buttonStyle as ButtonStyleId)
      : 'rounded',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setDraft(patch: Partial<ProfileDraft>) {
    setDraftState((prev) => {
      const next = { ...prev, ...patch }
      onDraftChange(next)
      return next
    })
    setSaved(false)
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.displayName.trim()) {
      setError('Display name is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updatePage({
        data: {
          displayName: draft.displayName.trim(),
          bio: draft.bio.trim(),
          theme: draft.theme,
          buttonStyle: draft.buttonStyle,
        },
      })
      await router.invalidate()
      setSaved(true)
    } catch {
      setError('Could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Appearance</h2>
      <p className="mt-1 text-sm text-stone-500">
        How your page looks at <span className="font-medium text-stone-700">/links/{page.slug}</span>
      </p>

      <form onSubmit={onSave} className="mt-5 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-stone-700">
              Display name
            </label>
            <input
              id="profile-name"
              type="text"
              value={draft.displayName}
              onChange={(e) => setDraft({ displayName: e.target.value })}
              maxLength={50}
              className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label htmlFor="profile-bio" className="block text-sm font-medium text-stone-700">
              Bio
            </label>
            <input
              id="profile-bio"
              type="text"
              value={draft.bio}
              onChange={(e) => setDraft({ bio: e.target.value })}
              placeholder="Tell visitors who you are"
              maxLength={200}
              className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-stone-700">Theme</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {THEME_IDS.map((id) => {
              const theme = THEMES[id]
              const selected = draft.theme === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDraft({ theme: id })}
                  aria-pressed={selected}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <span
                    className={`block size-12 rounded-xl ${theme.swatch} ${
                      selected
                        ? 'ring-2 ring-indigo-600 ring-offset-2'
                        : 'ring-1 ring-stone-200 group-hover:ring-stone-400'
                    }`}
                  />
                  <span
                    className={`text-xs ${selected ? 'font-semibold text-stone-900' : 'text-stone-500'}`}
                  >
                    {theme.label}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-stone-700">Button shape</legend>
          <div className="mt-2 flex gap-3">
            {BUTTON_STYLE_IDS.map((id) => {
              const selected = draft.buttonStyle === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDraft({ buttonStyle: id })}
                  aria-pressed={selected}
                  className={`border px-5 py-2 text-sm font-medium ${BUTTON_STYLES[id].class} ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-stone-300 text-stone-600 hover:border-stone-500'
                  }`}
                >
                  {BUTTON_STYLES[id].label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="text-sm font-medium text-green-700">Saved ✓</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </section>
  )
}
