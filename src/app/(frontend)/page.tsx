import { notFound } from 'next/navigation'
import { getPageBySlug, isDraftMode } from '@/lib/payload'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import type { BlockData } from '@/lib/types'

export default async function HomePage() {
  const page = await getPageBySlug('home', await isDraftMode())
  if (!page) notFound()
  return <RenderBlocks blocks={page.layout as BlockData[]} />
}
