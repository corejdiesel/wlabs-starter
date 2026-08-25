import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayloadClient, isDraftMode } from '@/lib/payload'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Container, Section, Heading } from '@/components/ui/primitives'
import type { BlockData } from '@/lib/types'

type Args = { params: Promise<{ slug: string }> }

async function getPost(slug: string, draft: boolean) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: draft,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug, false)
  return { title: (post?.title as string) ?? 'Not found', description: (post?.excerpt as string) ?? undefined }
}

export default async function PostPage({ params }: Args) {
  const { slug } = await params
  const post = await getPost(slug, await isDraftMode())
  if (!post) notFound()

  return (
    <article>
      <Section>
        <Container>
          <div className="mx-auto max-w-3xl">
            <Heading level={1} hero>
              {post.title as string}
            </Heading>
          </div>
        </Container>
      </Section>
      <RenderBlocks blocks={post.layout as BlockData[]} />
    </article>
  )
}
