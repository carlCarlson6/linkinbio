import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { linkinbios } from '../db/schema'
import { eq } from 'drizzle-orm'

const getLinkinbioBySlug = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const normalized = slug.startsWith('@') ? slug.slice(1) : slug;
    const [page] = await db
      .select()
      .from(linkinbios)
      .where(eq(linkinbios.slug, normalized))
      .limit(1);
    return page ?? null;
  });

export const Route = createFileRoute('/$slug')({
  loader: async ({ params }) => {
    const page = await getLinkinbioBySlug({ data: params.slug });
    if (!page) throw notFound();
    return page;
  },
  notFoundComponent: NotFoundPage,
  ssr: true,
  component: RouteComponent,
})

function RouteComponent() {
  const page = Route.useLoaderData();

  return (
    <main className="grid min-h-screen place-items-center bg-linear-to-b from-slate-50 to-slate-100 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <p className="text-3xl font-bold text-slate-900">@{page.slug}</p>
        <p className="mt-2 text-sm text-slate-500">Linkinbio page</p>
      </section>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="text-center">
        <p className="text-6xl font-bold text-slate-300">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-800">Page not found</h1>
        <p className="mt-2 text-slate-500">
          The link-in-bio page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Go home
        </a>
      </section>
    </main>
  )
}
