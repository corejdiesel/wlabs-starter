import { Container, Section, Heading, Button } from '@/components/ui/primitives'

export default function NotFound() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <Heading level={1} hero>
            Page not found
          </Heading>
          <p className="mt-4" style={{ color: 'var(--color-ink-muted)' }}>
            That page doesn&rsquo;t exist, or has moved.
          </p>
          <div className="mt-8">
            <Button href="/">Back to home</Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
