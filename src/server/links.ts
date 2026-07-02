import { createServerFn } from '@tanstack/react-start'
import { eq, sql } from 'drizzle-orm'
import z from 'zod'
import { db } from '../db'
import { linkinbios, links } from '../db/schema'
import { requireUserId } from './auth'

const linkFields = {
  title: z.string().trim().min(1, 'Title is required').max(80),
  url: z.url({ error: 'Enter a valid URL (including https://)' }).max(2048),
}

async function requireMyPage(userId: string) {
  const page = await db.query.linkinbios.findFirst({
    where: eq(linkinbios.userId, userId),
  })
  if (!page) {
    throw new Error('No linkinbio page found for this user')
  }
  return page
}

async function requireMyLink(userId: string, linkId: string) {
  const page = await requireMyPage(userId)
  const link = await db.query.links.findFirst({ where: eq(links.id, linkId) })
  if (!link || link.linkinbioId !== page.id) {
    throw new Error('Link not found')
  }
  return { page, link }
}

export const createLink = createServerFn({ method: 'POST' })
  .validator(z.object(linkFields))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const page = await requireMyPage(userId)

    const [{ maxOrder }] = await db
      .select({ maxOrder: sql<number>`coalesce(max(${links.sortOrder}), -1)` })
      .from(links)
      .where(eq(links.linkinbioId, page.id))

    await db.insert(links).values({
      linkinbioId: page.id,
      title: data.title,
      url: data.url,
      sortOrder: Number(maxOrder) + 1,
    })

    return { ok: true as const }
  })

export const updateLink = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), ...linkFields }))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    await requireMyLink(userId, data.id)

    await db
      .update(links)
      .set({ title: data.title, url: data.url })
      .where(eq(links.id, data.id))

    return { ok: true as const }
  })

export const deleteLink = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    await requireMyLink(userId, data.id)

    await db.delete(links).where(eq(links.id, data.id))

    return { ok: true as const }
  })

export const moveLink = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), direction: z.enum(['up', 'down']) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId()
    const { page } = await requireMyLink(userId, data.id)

    const ordered = await db.query.links.findMany({
      where: eq(links.linkinbioId, page.id),
      orderBy: (l, { asc }) => [asc(l.sortOrder), asc(l.createdAt)],
    })

    const index = ordered.findIndex((l) => l.id === data.id)
    const targetIndex = data.direction === 'up' ? index - 1 : index + 1
    if (index === -1 || targetIndex < 0 || targetIndex >= ordered.length) {
      return { ok: true as const }
    }

    // Normalize sort orders to their index so swapping is always well-defined,
    // even if stored values contain duplicates.
    await db.transaction(async (tx) => {
      for (let i = 0; i < ordered.length; i++) {
        const swapped = i === index ? targetIndex : i === targetIndex ? index : i
        if (ordered[i].sortOrder !== swapped) {
          await tx.update(links).set({ sortOrder: swapped }).where(eq(links.id, ordered[i].id))
        }
      }
    })

    return { ok: true as const }
  })
