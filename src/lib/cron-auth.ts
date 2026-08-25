import type { NextRequest } from 'next/server'

/**
 * Authorise a cron / revalidation request. Fails CLOSED: if no secret is
 * configured the request is rejected, rather than leaving these endpoints
 * public whenever the env var happens to be unset.
 *
 * Accepts either Vercel Cron's `Authorization: Bearer ${CRON_SECRET}` header,
 * or `?secret=${REVALIDATE_SECRET}` used by the Payload afterChange hook.
 */
export function isAuthorizedCron(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && req.headers.get('authorization') === `Bearer ${cronSecret}`) return true

  const revalidateSecret = process.env.REVALIDATE_SECRET
  if (revalidateSecret && req.nextUrl.searchParams.get('secret') === revalidateSecret) return true

  return false
}
