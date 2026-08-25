import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageBySlug, getPayloadClient, isDraftMode } from '@/lib/payload'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import type { BlockData } from '@/lib/types'

type Args = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'pages', limit: 500, select: { slug: true } })
  return docs.filter((d) => d.slug !== 'home').map((d) => ({ slug: d.slug as string }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  return { title: (page?.title as string) ?? 'Not found' }
}

export default async function Page({ params }: Args) {
  const { slug } = await params
  const page = await getPageBySlug(slug, await isDraftMode())
  if (!page) notFound()
  return <RenderBlocks blocks={page.layout as BlockData[]} />
}
