import type { Link } from '../db/schema'

// Chart series color (validated against the white card surface).
const SERIES = '#2a78d6'

type AnalyticsData = {
  totalViews: number
  totalClicks: number
  viewsByDay: { day: string; views: number }[]
  clicksByLink: Record<string, number>
}

type Props = {
  analytics: AnalyticsData
  links: Link[]
}

const compactFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

function weekdayLabel(day: string): string {
  return new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(`${day}T00:00:00Z`),
  )
}

function dateLabel(day: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${day}T00:00:00Z`))
}

export function Analytics({ analytics, links }: Props) {
  const { totalViews, totalClicks, viewsByDay, clicksByLink } = analytics
  const clickRate = totalViews > 0 ? `${((totalClicks / totalViews) * 100).toFixed(1)}%` : '—'

  return (
    <section aria-label="Analytics">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Total views" value={compactFormat.format(totalViews)} hint="All time" />
        <StatTile label="Total clicks" value={compactFormat.format(totalClicks)} hint="All time" />
        <StatTile label="Click rate" value={clickRate} hint="Clicks per view" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-stone-500">Views · last 7 days</h3>
          <ViewsChart data={viewsByDay} />
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-stone-500">Clicks by link</h3>
          <ClicksByLink links={links} clicksByLink={clicksByLink} />
        </div>
      </div>
    </section>
  )
}

function StatTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-stone-900">{value}</p>
      <p className="mt-1 text-xs text-stone-400">{hint}</p>
    </div>
  )
}

function ViewsChart({ data }: { data: { day: string; views: number }[] }) {
  const max = Math.max(...data.map((d) => d.views))

  return (
    <div className="mt-4">
      <div className="flex h-32 items-end gap-2 border-b border-stone-300">
        {data.map((d) => {
          const isPeak = max > 0 && d.views === max
          return (
            <div
              key={d.day}
              tabIndex={0}
              aria-label={`${d.views} views on ${dateLabel(d.day)}`}
              className="group relative flex h-full flex-1 flex-col items-center justify-end outline-none"
            >
              {/* Tooltip: value leads, date follows */}
              <div className="pointer-events-none absolute bottom-full z-10 mb-1.5 hidden whitespace-nowrap rounded-md bg-stone-900 px-2.5 py-1.5 text-xs text-white group-hover:block group-focus-visible:block">
                <span className="font-semibold">
                  {d.views} {d.views === 1 ? 'view' : 'views'}
                </span>{' '}
                <span className="text-stone-300">{dateLabel(d.day)}</span>
              </div>
              {isPeak && (
                <span className="mb-1 text-xs font-medium text-stone-600">{d.views}</span>
              )}
              {d.views > 0 ? (
                <div
                  className="w-full max-w-6 rounded-t transition group-hover:brightness-75 group-focus-visible:brightness-75"
                  style={{
                    height: `${Math.max((d.views / max) * 100, 3)}%`,
                    backgroundColor: SERIES,
                  }}
                />
              ) : (
                <div className="h-px w-full max-w-6 bg-stone-200" />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex gap-2">
        {data.map((d) => (
          <span key={d.day} className="flex-1 text-center text-[10px] text-stone-400">
            {weekdayLabel(d.day)}
          </span>
        ))}
      </div>
      {max === 0 && (
        <p className="mt-3 text-center text-sm text-stone-400">
          No views yet — share your page to see activity here.
        </p>
      )}
    </div>
  )
}

function ClicksByLink({
  links,
  clicksByLink,
}: {
  links: Link[]
  clicksByLink: Record<string, number>
}) {
  const rows = links
    .map((link) => ({ id: link.id, title: link.title, clicks: clicksByLink[link.id] ?? 0 }))
    .sort((a, b) => b.clicks - a.clicks)
  const max = Math.max(...rows.map((r) => r.clicks), 0)

  if (rows.length === 0) {
    return <p className="mt-4 text-sm text-stone-400">Add links to start tracking clicks.</p>
  }

  return (
    <ul className="mt-4 space-y-3">
      {rows.map((row) => (
        <li key={row.id}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-stone-700">{row.title}</span>
            <span className="text-sm font-medium tabular-nums text-stone-900">{row.clicks}</span>
          </div>
          <div className="mt-1 h-2">
            {row.clicks > 0 && (
              <div
                className="h-full rounded-r"
                style={{
                  width: `${Math.max((row.clicks / max) * 100, 2)}%`,
                  backgroundColor: SERIES,
                }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
