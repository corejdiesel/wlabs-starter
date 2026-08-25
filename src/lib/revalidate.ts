import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

/**
 * Purge the cached page as soon as an editor publishes. Without this an edit
 * appears saved in the admin but unchanged on the live site, which is the
 * single most common "the CMS is broken" report.
 *
 * `revalidatePath` throws outside a Next request context ("static generation
 * store missing"), which is exactly where seeds, migrations and any other
 * programmatic write run. There is no cache to purge in those contexts, so
 * failing there would break content creation for no benefit.
 */
const safeRevalidate = (path: string) => {
  try {
    revalidatePath(path)
  } catch {
    // Not in a request context — nothing is cached, nothing to purge.
  }
}

export const revalidatePage: CollectionAfterChangeHook = ({ doc }) => {
  if (doc?._status !== 'published') return doc
  safeRevalidate(doc.slug === 'home' ? '/' : `/${doc.slug}`)
  return doc
}

export const revalidatePost: CollectionAfterChangeHook = ({ doc }) => {
  if (doc?._status !== 'published') return doc
  safeRevalidate(`/posts/${doc.slug}`)
  safeRevalidate('/posts')
  return doc
}
