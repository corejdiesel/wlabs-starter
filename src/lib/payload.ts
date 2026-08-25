import { getPayload } from 'payload'
import config from '@payload-config'
import { draftMode } from 'next/headers'

export const getPayloadClient = async () => getPayload({ config })

/** True when the visitor is previewing an unpublished draft. */
export const isDraftMode = async () => (await draftMode()).isEnabled

export async function getGlobal<T = unknown>(slug: 'site-settings' | 'navigation' | 'footer') {
  const payload = await getPayloadClient()
  return (await payload.findGlobal({ slug, depth: 2 })) as T
}

export async function getPageBySlug(slug: string, draft = false) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
  })
  return docs[0] ?? null
}
