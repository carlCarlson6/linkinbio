import { initTRPC } from '@trpc/server';
import { getAuth } from '@clerk/express';
import type { Request, Response } from 'express';
import { db } from 'db/client';
import { bioTable, linksSchema } from 'db/schema/bio';
import { eq } from 'drizzle-orm';
import z from 'zod';

// tRPC context with user
export async function createTrpcContext({ req }: { req: Request; res: Response }) {
  const auth = getAuth(req);
  return {
    user: auth.userId ? { id: auth.userId } : null,
  };
}

const t = initTRPC.context<typeof createTrpcContext>().create();

const protectedProcedure = t.procedure.use(t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('Not authenticated');
  }
  return next({ 
    ctx: {
      ...ctx,
      user: ctx.user, // Pass the user context to the next handler
    },
  });
}));

const dashboardInfo = protectedProcedure.query(async ({ ctx }) => {
  // Query bios from the database for the current user
  const bios = await db.select().from(bioTable).where(eq(bioTable.userId, ctx.user.id));
  return bios.map(bio => ({
    ...bio,
    links: linksSchema.parse(bio.links), // Validate links using zod schema
  }));
});

const createBio = protectedProcedure
  .input(z.object({
    slug: z.string().min(1),
    displayName: z.string().optional(),
    description: z.string().optional(),
    links: z.array(z.object({
      url: z.string().min(1),
      label: z.string().optional(),
    })).min(1),
  }))
  .mutation(async ({ input, ctx }) => {
    const [created] = await db
      .insert(bioTable)
      .values({
        slug: input.slug,
        userId: ctx.user.id,
        displayName: input.displayName,
        description: input.description,
        links: input.links,
      })
      .returning();
    return created;
  });


export const beAppRouter = t.router({
  dashboardInfo,
  createBio
});

export type BeAppRouter = typeof beAppRouter;
