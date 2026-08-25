import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { Container, Section, Heading, Prose, Button } from '@/components/ui/primitives'
import { Placeholder } from '@/components/ui/Placeholder'
import { asMedia, type BlockData } from '@/lib/types'

function Media({ value, ratio, sizes }: { value: unknown; ratio?: string; sizes?: string }) {
  const media = asMedia(value)
  if (!media?.url) return <Placeholder ratio={ratio} />
  return (
    <Image
      src={media.url}
      alt={media.alt ?? ''}
      width={media.width ?? 1600}
      height={media.height ?? 900}
      sizes={sizes ?? '100vw'}
      className="h-auto w-full object-cover"
      style={{ borderRadius: 'var(--radius-base)' }}
    />
  )
}

function Hero({ block }: { block: BlockData }) {
  const layout = (block.layout as string) ?? 'centered'
  const full = layout === 'full-bleed'
  const split = layout === 'image-right'

  return (
    <Section>
      <Container>
        <div className={split ? 'grid items-center gap-12 md:grid-cols-2' : ''}>
          <div className={split ? '' : 'mx-auto max-w-3xl text-center'}>
            <Heading level={1} hero>
              {block.heading as string}
            </Heading>
            {block.subheading ? (
              <div className={split ? 'mt-5' : 'mt-5 flex justify-center'}>
                <Prose>
                  <p>{block.subheading as string}</p>
                </Prose>
              </div>
            ) : null}
            {block.label ? (
              <div className={split ? 'mt-8' : 'mt-8 flex justify-center'}>
                <Button href={block.href as string}>{block.label as string}</Button>
              </div>
            ) : null}
          </div>
          {(split || full) && (
            <div className={split ? '' : 'mt-14'}>
              <Media value={block.image} ratio={split ? '4 / 3' : '21 / 9'} />
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}

function RichTextBlock({ block }: { block: BlockData }) {
  return (
    <Section>
      <Container>
        <Prose wide={block.width === 'wide'}>
          <RichText data={block.content as SerializedEditorState} />
        </Prose>
      </Container>
    </Section>
  )
}

function ImageBlock({ block }: { block: BlockData }) {
  const inner = (
    <figure>
      <Media value={block.image} />
      {block.caption ? (
        <figcaption className="mt-3 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
          {block.caption as string}
        </figcaption>
      ) : null}
    </figure>
  )
  return <Section>{block.size === 'full' ? <div className="px-6">{inner}</div> : <Container>{inner}</Container>}</Section>
}

function Gallery({ block }: { block: BlockData }) {
  const images = (block.images as Array<{ image: unknown; caption?: string }>) ?? []
  const cols = (block.columns as string) ?? '3'
  const gridCols = cols === '2' ? 'sm:grid-cols-2' : cols === '4' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'

  return (
    <Section>
      <Container>
        <div className={`grid gap-6 ${gridCols}`}>
          {images.map((item, i) => (
            <figure key={i}>
              <Media value={item.image} ratio="4 / 3" sizes="(max-width: 640px) 100vw, 33vw" />
              {item.caption ? (
                <figcaption className="mt-2 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  )
}

function CTA({ block }: { block: BlockData }) {
  return (
    <Section alt>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Heading level={2}>{block.heading as string}</Heading>
          {block.body ? (
            <div className="mt-4 flex justify-center">
              <Prose>
                <p>{block.body as string}</p>
              </Prose>
            </div>
          ) : null}
          <div className="mt-8">
            <Button href={block.href as string}>{block.label as string}</Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}

function FeatureGrid({ block }: { block: BlockData }) {
  const items = (block.items as Array<{ title: string; body?: string; icon?: unknown }>) ?? []
  return (
    <Section>
      <Container>
        {block.heading ? (
          <div className="mb-12">
            <Heading level={2}>{block.heading as string}</Heading>
          </div>
        ) : null}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div key={i}>
              {item.icon ? (
                <div className="mb-4 w-12">
                  <Media value={item.icon} ratio="1 / 1" sizes="48px" />
                </div>
              ) : null}
              <h3 style={{ fontSize: '1.15rem' }}>{item.title}</h3>
              {item.body ? (
                <p className="mt-2 leading-relaxed" style={{ color: 'var(--color-ink-muted)' }}>
                  {item.body}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

function LogoStrip({ block }: { block: BlockData }) {
  const logos = (block.logos as Array<{ logo: unknown }>) ?? []
  return (
    <Section alt>
      <Container>
        <div className="text-center">
          {block.heading ? (
            <p className="text-xs tracking-[0.16em] uppercase" style={{ color: 'var(--color-ink-muted)' }}>
              {block.heading as string}
            </p>
          ) : null}
          {logos.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
              {logos.map((item, i) => (
                <div key={i} className="w-28 opacity-70">
                  <Media value={item.logo} ratio="3 / 2" sizes="112px" />
                </div>
              ))}
            </div>
          )}
          {block.quote ? (
            <blockquote className="mx-auto mt-12 max-w-2xl">
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-section)' }}>
                &ldquo;{block.quote as string}&rdquo;
              </p>
              {block.attribution ? (
                <cite className="mt-4 block text-sm not-italic" style={{ color: 'var(--color-ink-muted)' }}>
                  {block.attribution as string}
                </cite>
              ) : null}
            </blockquote>
          ) : null}
        </div>
      </Container>
    </Section>
  )
}

function FormBlock({ block }: { block: BlockData }) {
  const form = block.form as { id?: string; title?: string } | null
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-xl">
          {block.heading ? <Heading level={2}>{block.heading as string}</Heading> : null}
          {block.intro ? (
            <div className="mt-4">
              <Prose>
                <p>{block.intro as string}</p>
              </Prose>
            </div>
          ) : null}
          {/* Field rendering is wired in Phase 4 alongside Turnstile verification. */}
          <div
            className="mt-8 p-6 text-sm"
            style={{ border: '1px solid var(--color-line)', borderRadius: 'var(--radius-base)', color: 'var(--color-ink-muted)' }}
          >
            Form: {form?.title ?? 'select a form in the admin'}
          </div>
        </div>
      </Container>
    </Section>
  )
}

const registry: Record<string, (props: { block: BlockData }) => React.ReactNode> = {
  hero: Hero,
  richText: RichTextBlock,
  image: ImageBlock,
  gallery: Gallery,
  cta: CTA,
  featureGrid: FeatureGrid,
  logoStrip: LogoStrip,
  formBlock: FormBlock,
}

export function RenderBlocks({ blocks }: { blocks?: BlockData[] | null }) {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block, i) => {
        const Component = registry[block.blockType]
        if (!Component) return null
        return <Component key={block.id ?? i} block={block} />
      })}
    </>
  )
}
