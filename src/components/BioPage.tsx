import { getButtonStyleClass, getTheme } from '../lib/themes'

export type BioPageData = {
  slug: string
  displayName: string
  bio: string
  theme: string
  buttonStyle: string
  links: { id: string; title: string; url: string }[]
}

type Props = {
  data: BioPageData
  onLinkClick?: (linkId: string) => void
  /** Tighter spacing for the dashboard preview */
  compact?: boolean
}

export function BioPage({ data, onLinkClick, compact = false }: Props) {
  const theme = getTheme(data.theme)
  const buttonClass = getButtonStyleClass(data.buttonStyle)
  const name = data.displayName || data.slug
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={`flex min-h-full w-full flex-col items-center px-6 ${compact ? 'py-10' : 'py-16'} ${theme.page}`}
    >
      <div
        className={`flex ${compact ? 'size-14 text-xl' : 'size-20 text-3xl'} items-center justify-center rounded-full font-bold ${theme.avatar}`}
      >
        {initial}
      </div>
      <h1 className={`mt-4 text-center ${compact ? 'text-lg' : 'text-2xl'} font-bold ${theme.name}`}>
        {name}
      </h1>
      <p className={`mt-0.5 text-center text-sm ${theme.name} opacity-60`}>@{data.slug}</p>
      {data.bio && (
        <p className={`mt-3 max-w-md text-center ${compact ? 'text-xs' : 'text-sm'} ${theme.bio}`}>
          {data.bio}
        </p>
      )}

      <div className={`mt-8 flex w-full ${compact ? 'max-w-xs' : 'max-w-md'} flex-col gap-3`}>
        {data.links.length === 0 && (
          <p className={`text-center text-sm ${theme.bio}`}>No links yet.</p>
        )}
        {data.links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onLinkClick?.(link.id)}
            className={`block w-full px-5 ${compact ? 'py-2.5 text-sm' : 'py-3.5'} text-center font-medium transition ${theme.button} ${buttonClass}`}
          >
            {link.title}
          </a>
        ))}
      </div>

      <a
        href="/"
        className={`mt-auto pt-12 text-xs font-medium ${theme.bio} opacity-70 hover:opacity-100`}
      >
        linkinbio
      </a>
    </div>
  )
}
