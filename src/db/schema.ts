import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const linkinbios = pgTable('linkinbios', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Linkinbio = typeof linkinbios.$inferSelect;
export type NewLinkinbio = typeof linkinbios.$inferInsert;
