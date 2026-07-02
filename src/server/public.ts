import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import z from 'zod'
import { db } from '../db'
import { linkClicks, linkinbios, links, pageViews } from '../db/schema'

export type PublicPage = NonNullable<Awaited<ReturnType<typeof getPublicPage>>>

export const getPublicPage = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().trim().toLowerCase().max(100) }))
  .handler(async ({ data }) => {
    const page = await db.query.linkinbios.findFirst({
      where: eq(linkinbios.slug, data.slug),
    })
    if (!page) return null

    const pageLinks = await db.query.links.findMany({
      where: eq(links.linkinbioId, page.id),
      orderBy: (l, { asc }) => [asc(l.sortOrder), asc(l.createdAt)],
    })

    // Record the visit. Never expose internal fields (userId) to the public payload.
    await db.insert(pageViews).values({ linkinbioId: page.id })

    return {
      slug: page.slug,
      displayName: page.displayName,
      bio: page.bio,
      theme: page.theme,
      buttonStyle: page.buttonStyle,
      links: pageLinks.map((l) => ({ id: l.id, title: l.title, url: l.url })),
    }
  })

export const trackClick = createServerFn({ method: 'POST' })
  .validator(z.object({ linkId: z.uuid() }))
  .handler(async ({ data }) => {
    const link = await db.query.links.findFirst({ where: eq(links.id, data.linkId) })
    if (!link) return { ok: false as const }

    await db.insert(linkClicks).values({
      linkId: link.id,
      linkinbioId: link.linkinbioId,
    })

    return { ok: true as const }
  })
