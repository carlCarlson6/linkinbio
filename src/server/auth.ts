import { auth } from '@clerk/tanstack-react-start/server'
import { redirect } from '@tanstack/react-router'

/** Returns the Clerk user id or redirects to the landing page. Server-side only. */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) {
    throw redirect({ to: '/' })
  }
  return userId
}
