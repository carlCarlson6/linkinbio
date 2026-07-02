export type Theme = {
  label: string
  /** Page background */
  page: string
  /** Display name text */
  name: string
  /** Bio / secondary text */
  bio: string
  /** Link button appearance (color, border, hover) */
  button: string
  /** Avatar circle */
  avatar: string
  /** Small swatch used in the dashboard theme picker */
  swatch: string
}

export const THEMES = {
  midnight: {
    label: 'Midnight',
    page: 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800',
    name: 'text-white',
    bio: 'text-slate-300',
    button: 'bg-white/10 text-white border border-white/15 hover:bg-white/20',
    avatar: 'bg-indigo-500 text-white',
    swatch: 'bg-gradient-to-b from-slate-950 to-slate-700',
  },
  sunset: {
    label: 'Sunset',
    page: 'bg-gradient-to-b from-orange-400 via-rose-500 to-purple-700',
    name: 'text-white',
    bio: 'text-orange-100',
    button: 'bg-white/90 text-rose-700 hover:bg-white',
    avatar: 'bg-white text-rose-600',
    swatch: 'bg-gradient-to-b from-orange-400 to-purple-700',
  },
  ocean: {
    label: 'Ocean',
    page: 'bg-gradient-to-b from-cyan-600 via-sky-700 to-blue-900',
    name: 'text-white',
    bio: 'text-cyan-100',
    button: 'bg-white/15 text-white border border-white/20 hover:bg-white/25',
    avatar: 'bg-cyan-300 text-blue-900',
    swatch: 'bg-gradient-to-b from-cyan-500 to-blue-900',
  },
  forest: {
    label: 'Forest',
    page: 'bg-gradient-to-b from-emerald-900 via-green-800 to-teal-900',
    name: 'text-white',
    bio: 'text-emerald-200',
    button: 'bg-emerald-100 text-emerald-950 hover:bg-white',
    avatar: 'bg-emerald-300 text-emerald-950',
    swatch: 'bg-gradient-to-b from-emerald-900 to-teal-800',
  },
  candy: {
    label: 'Candy',
    page: 'bg-gradient-to-b from-pink-200 via-fuchsia-200 to-violet-300',
    name: 'text-fuchsia-950',
    bio: 'text-fuchsia-800',
    button: 'bg-white text-fuchsia-900 shadow-sm hover:bg-fuchsia-50',
    avatar: 'bg-fuchsia-500 text-white',
    swatch: 'bg-gradient-to-b from-pink-200 to-violet-300',
  },
  paper: {
    label: 'Paper',
    page: 'bg-stone-100',
    name: 'text-stone-900',
    bio: 'text-stone-600',
    button: 'bg-white text-stone-900 border border-stone-300 shadow-sm hover:border-stone-500',
    avatar: 'bg-stone-900 text-white',
    swatch: 'bg-stone-100 border border-stone-300',
  },
} as const satisfies Record<string, Theme>

export type ThemeId = keyof typeof THEMES

export const THEME_IDS = Object.keys(THEMES) as [ThemeId, ...ThemeId[]]

export const BUTTON_STYLES = {
  rounded: { label: 'Rounded', class: 'rounded-xl' },
  pill: { label: 'Pill', class: 'rounded-full' },
  square: { label: 'Square', class: 'rounded-none' },
} as const

export type ButtonStyleId = keyof typeof BUTTON_STYLES

export const BUTTON_STYLE_IDS = Object.keys(BUTTON_STYLES) as [ButtonStyleId, ...ButtonStyleId[]]

export function getTheme(id: string): Theme {
  return THEMES[id as ThemeId] ?? THEMES.midnight
}

export function getButtonStyleClass(id: string): string {
  return (BUTTON_STYLES[id as ButtonStyleId] ?? BUTTON_STYLES.rounded).class
}
