import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const linkinbios = pgTable('linkinbios', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Linkinbio = typeof linkinbios.$inferSelect;
export type NewLinkinbio = typeof linkinbios.$inferInsert;

export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  linkinbioId: uuid('linkinbio_id').notNull().references(() => linkinbios.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
