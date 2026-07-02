import { createServerFn } from '@tanstack/react-start'
import { and, count, eq, gte, sql } from 'drizzle-orm'
import z from 'zod'
import { db } from '../db'
import { linkClicks, linkinbios, links, pageViews } from '../db/schema'
import { BUTTON_STYLE_IDS, THEME_IDS } from '../lib/themes'
import { slugSchema } from '../lib/slug'
import { requireUserId } from './auth'

const ANALYTICS_DAYS = 7

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === '23505'
  )
}

/** Last N calendar days (UTC) as YYYY-MM-DD strings, oldest first, ending today. */
function lastDays(n: number): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>

export const getDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const userId = await requireUserId()

  const page = await db.query.linkinbios.findFirst({
    where: eq(linkinbios.userId, userId),
  })
  if (!page) return null

  const pageLinks = await db.query.links.findMany({
    where: eq(links.linkinbioId, page.id),
    orderBy: (l, { asc }) => [asc(l.sortOrder), asc(l.createdAt)],
  })

  const since = new Date()
  since.setUTCDate(since.getUTCDate() - (ANALYTICS_DAYS - 1))
  since.setUTCHours(0, 0, 0, 0)

  const viewDay = sql<string>`to_char(${pageViews.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`

  const [[viewTotal], [clickTotal], viewRows, clickRows] = await Promise.all([
    db.select({ value: count() }).from(pageViews).where(eq(pageViews.linkinbioId, page.id)),
    db.select({ value: count() }).from(linkClicks).where(eq(linkClicks.linkinbioId, page.id)),
    db
      .select({ day: viewDay, value: count() })
      .from(pageViews)
      .where(and(eq(pageViews.linkinbioId, page.id), gte(pageViews.createdAt, since)))
      .groupBy(viewDay),
    db
      .select({ linkId: linkClicks.linkId, value: count() })
      .from(linkClicks)
      .where(eq(linkClicks.linkinbioId, page.id))
      .groupBy(linkClicks.linkId),
  ])

  const viewsByDayMap = new Map(viewRows.map((r) => [r.day, r.value]))
  const viewsByDay = lastDays(ANALYTICS_DAYS).map((day) => ({
    day,
    views: viewsByDayMap.get(day) ?? 0,
  }))

  const clicksByLink: Record<string, number> = {}
  for (const row of clickRows) {
    clicksByLink[row.linkId] = row.value
  }

  return {
    page,
    links: pageLinks,
    analytics: {
      totalViews: viewTotal?.value ?? 0,
      totalClicks: clickTotal?.value ?? 0,
      viewsByDay,
      clicksByLink,
    },
  }
})

const createInput = z.object({
  slug: slugSchema,
  displayName: z.string().trim().max(50),
})

export const createLinkinbio = createServerFn({ method: 'POST' })
  .validator(createInput)
  .handler(async ({ data }) => {
    const userId = await requireUserId()

    const existing = await db.query.linkinbios.findFirst({
      where: eq(linkinbios.userId, userId),
    })
    if (existing) {
      return { ok: false as const, error: 'You already have a page' }
    }

    try {
      await db.insert(linkinbios).values({
        userId,
        slug: data.slug,
        displayName: data.displayName || data.slug,
      })
      return { ok: true as const }
    } catch (error) {
      if (isUniqueViolation(error)) {
        return { ok: false as const, error: 'That handle is already taken' }
      }
      throw error
    }
  })

const updateInput = z.object({
  displayName: z.string().trim().min(1, 'Display name is required').max(50),
  bio: z.string().trim().max(200),
  theme: z.enum(THEME_IDS),
  buttonStyle: z.enum(BUTTON_STYLE_IDS),
})

export const updatePage = createServerFn({ method: 'POST' })
  .validator(updateInput)
  .handler(async ({ data }) => {
    const userId = await requireUserId()

    await db
      .update(linkinbios)
      .set({
        displayName: data.displayName,
        bio: data.bio,
        theme: data.theme,
        buttonStyle: data.buttonStyle,
      })
      .where(eq(linkinbios.userId, userId))

    return { ok: true as const }
  })
