import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Container, Section, Heading } from '@/components/ui/primitives'

export const metadata = { title: 'Journal' }

export default async function PostsIndex() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    limit: 50,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  return (
    <Section>
      <Container>
        <Heading level={1} hero>
          Journal
        </Heading>
        <div className="mt-12 flex flex-col">
          {docs.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group py-6"
              style={{ borderTop: '1px solid var(--color-line)' }}
            >
              <h2 style={{ fontSize: '1.4rem' }} className="group-hover:opacity-70">
                {post.title as string}
              </h2>
              {post.excerpt ? (
                <p className="mt-2" style={{ color: 'var(--color-ink-muted)' }}>
                  {post.excerpt as string}
                </p>
              ) : null}
            </Link>
          ))}
          {docs.length === 0 && <p style={{ color: 'var(--color-ink-muted)' }}>No posts yet.</p>}
        </div>
      </Container>
    </Section>
  )
}
