// src/routes/index.tsx
import * as fs from 'node:fs'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'

const filePath = 'count.txt'

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'),
  )
}

const getCount = createServerFn({
  method: 'GET',
}).handler(() => {
  console.log('Reading count...');
  return readCount()
})

const updateCount = createServerFn({ method: 'POST' })
  .inputValidator((d: number) => d)
  .handler(async ({ data }) => {
    console.log('Updating count...');
    const count = await readCount();
    const newCount = count + data;
    await fs.promises.writeFile(filePath, `${newCount}`)
    return newCount
  })

export const Route = createFileRoute('/test')({
  component: Home,
  loader: async () => await getCount(),
})

function Home() {
  const router = useRouter();
  const state = Route.useLoaderData();

  const [count, setCount] = useState(state);

  return (
    <button
      type="button"
      onClick={() => {
        updateCount({ data: 1 }).then((newCount) => {
          setCount(newCount);
        })
      }}
    >
      Add 1 to {count}?
    </button>
  )
}