
import { pgTable, text, timestamp, varchar, json } from 'drizzle-orm/pg-core';
import z from 'zod';

export const bioTable = pgTable('bio', {
  slug: varchar('slug', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).notNull(),
  displayName: varchar('display_name', { length: 128 }),
  description: text('description'),
  links: json('links').notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const linksSchema = z.array(
  z.object({
    url: z.string().url().min(1),
    label: z.string().optional(),
  })
);