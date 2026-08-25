<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# wlabs-starter

Base for wlabs client sites. See `README.md` for setup.

## Stack
- **Next.js 16** App Router, two route groups: `(frontend)` public site,
  `(payload)` admin + REST/GraphQL at `/admin` and `/api`.
- **Payload 3** — config at `src/payload/config.ts`, aliased `@payload-config`.
- **Neon** Postgres via `@payloadcms/db-postgres`.
- **Cloudflare R2** via `@payloadcms/storage-s3`, `clientUploads: true`.
- **Tailwind v4** — CSS-first `@theme`, tokens in `src/styles/presets/`.

## Non-negotiables
- **Never hard-code a colour, font or size in a component.** Everything reads
  tokens from the active preset. Restyling must stay a token edit; a single
  hard-coded value turns the next rebrand into a component hunt.
- **`clientUploads` stays on.** Vercel caps function bodies at 4.5MB — about
  one phone photo. Without this, ordinary uploads fail.
- **Optional features are env-gated** and ship dormant. Follow the existing
  pattern (`...(process.env.X ? [plugin()] : [])`) rather than adding a
  feature later.
- **Every field gets a `label` and `admin.description`.** Non-technical people
  run these sites; an unexplained field is a support request.
- **Cron and revalidation auth fails closed** — see `src/lib/cron-auth.ts`.

## Schema changes
`push` is on in dev, off in production. Migrations are the source of truth:
`pnpm payload migrate:create`, commit, then `pnpm db:migrate`. Migration is
deliberately not part of `pnpm build`, so Vercel builds never hang on an
interactive prompt.
