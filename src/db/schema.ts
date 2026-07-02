import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const linkinbios = pgTable('linkinbio_linkinbios', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull().default(''),
  bio: text('bio').notNull().default(''),
  theme: text('theme').notNull().default('midnight'),
  buttonStyle: text('button_style').notNull().default('rounded'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Linkinbio = typeof linkinbios.$inferSelect
export type NewLinkinbio = typeof linkinbios.$inferInsert

export const links = pgTable(
  'linkinbio_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    linkinbioId: uuid('linkinbio_id')
      .notNull()
      .references(() => linkinbios.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    url: text('url').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index('linkinbio_links_linkinbio_idx').on(t.linkinbioId)],
)

export type Link = typeof links.$inferSelect
export type NewLink = typeof links.$inferInsert

export const pageViews = pgTable(
  'linkinbio_page_views',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    linkinbioId: uuid('linkinbio_id')
      .notNull()
      .references(() => linkinbios.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('linkinbio_page_views_linkinbio_created_idx').on(t.linkinbioId, t.createdAt)],
)

export type PageView = typeof pageViews.$inferSelect

export const linkClicks = pgTable(
  'linkinbio_link_clicks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    linkId: uuid('link_id')
      .notNull()
      .references(() => links.id, { onDelete: 'cascade' }),
    linkinbioId: uuid('linkinbio_id')
      .notNull()
      .references(() => linkinbios.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('linkinbio_link_clicks_link_idx').on(t.linkId),
    index('linkinbio_link_clicks_linkinbio_created_idx').on(t.linkinbioId, t.createdAt),
  ],
)

export type LinkClick = typeof linkClicks.$inferSelect
