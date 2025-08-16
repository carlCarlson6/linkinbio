import { initTRPC } from '@trpc/server';
import { getAuth } from '@clerk/express';
import type { Request, Response } from 'express';

// tRPC context with user
export async function createContext({ req }: { req: Request; res: Response }) {
  const auth = getAuth(req);
  return {
    user: auth.userId ? { id: auth.userId } : null,
  };
}

const t = initTRPC.context<typeof createContext>().create();

const publicProcedure = t.procedure;

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

export const appRouter = t.router({
  hello: publicProcedure.query(({ ctx }) => {
    return { greeting: `Hello from tRPC! User: ${ctx.user ? ctx.user.id : 'anonymous'}` };
  }),
  protectedHello: protectedProcedure.query(({ ctx }) => {
    return { greeting: `This is a protected procedure. User: ${ctx.user.id}` };
  }),
});

export type AppRouter = typeof appRouter;
