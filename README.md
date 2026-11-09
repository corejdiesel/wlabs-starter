# wlabs-starter

Base project for client sites. Next.js 16 + Payload 3 + Neon Postgres +
Cloudflare R2, deployed on Vercel behind proxied Cloudflare DNS.

The target: **one day** from generating the repo to a client-ready site, after
which a business owner or student can add and edit content unaided. It's also
the base for bespoke builds — fork it and delete the guardrails you don't want.

## Quick start

Needs Node 22.23.4 or newer (Payload 3.92+) and pnpm 10.

```bash
pnpm install
cp .env.example .env          # fill in DATABASE_URL + PAYLOAD_SECRET
pnpm generate:importmap
pnpm db:migrate               # provision the schema
pnpm seed                     # admin user + a working home page
pnpm dev                      # http://localhost:3000, admin at /admin
```

With `S3_BUCKET` blank, uploads fall back to local disk — you can develop with
no cloud account at all.

## Restyling — this is the whole job

Everything visual comes from design tokens. **No component hard-codes a colour,
font or size.**

1. Open `src/styles/globals.css` and point the preset import at
   `editorial`, `modern` or `minimal`.
2. Open that preset in `src/styles/presets/` and tune the ~20 token values —
   colours, fonts, type scale, spacing, radius.
3. Swap the two SVGs in `src/components/admin/Logo.tsx`.

That's the rebrand. If you find yourself editing a component to restyle
something, that's a missing token — add it to the preset rather than
hard-coding the value, or the next project pays for it again.

## Provisioning a new client

```bash
pnpm provision --client acme --preset modern
```

Creates the GitHub repo, Neon database, R2 bucket with CORS, Vercel project
with env vars and domain, Cloudflare DNS record, Umami site and UptimeRobot
monitor. See the header of `scripts/provision.ts` for the operator credentials
it needs. What it deliberately leaves manual is listed when it finishes.

## Runbooks

**Staging.** Push to a `staging` branch; Vercel builds a preview URL. Merge to
`main` to go live.

**Rollback.** Vercel → Deployments → pick the last good one → Promote to
Production. Every deploy is kept, so this is always available and takes under a
minute.

**Cloudflare.** Add the domain in Vercel *first* and leave DNS grey-clouded
until Vercel reports it verified with a certificate issued. Then turn the proxy
on and set SSL/TLS to **Full (strict)** — "Flexible" causes a redirect loop.

**Deploying.** `pnpm build` runs `payload migrate` first, so a deploy always
applies pending migrations before building. Nothing to remember at deploy time.
Never point `pnpm dev` at the production database: dev pushes the schema and
marks the database as dev-pushed, after which `payload migrate` offers to drop
and rebuild it — and waits for the answer, which hangs a CI build.

**Upgrading Payload.** Bump every `@payloadcms/*` package and `payload` to the
same version, keep `next` inside the range `@payloadcms/next` declares in its
peerDependencies, then `pnpm generate:types`, `pnpm payload migrate:create
<name>` and commit the migration. The 3.93 upgrade needed one migration
(`reset_password_requested_at` on users).

**Media on Vercel needs R2.** With `S3_BUCKET` blank, uploads fall back to
local disk — fine locally, broken on Vercel, whose filesystem is ephemeral and
read-only. Any deployed site that accepts uploads must have the `S3_*` vars set.

**Restoring a backup.** Once the backup route exists, nightly `pg_dump`
snapshots land in R2 under `backups/`, kept 30 days. Restore with
`psql "$DATABASE_URL" < dump.sql`.

## Content model

- **Pages** — block-built, any URL. `home` is the front page.
- **Posts** — the same blocks plus excerpt, cover image and scheduled publish.
- **Media** — uploads to R2; direct from the browser, so large files work.
- **Forms** — clients build their own; submissions email via Resend.
- **Site settings / Navigation / Footer** — admin-only, so an editor can't
  reshape the site.

### Blocks

Hero · Text · Image · Gallery · Call to action · Feature grid · Logos & quote ·
Form. Wide enough to cover an ordinary business site without writing new blocks
per project — that coverage is what keeps a build inside a day.

## Roles

- **Admin** — everything, including settings, navigation, redirects and users.
- **Editor** — pages, posts, media and forms only. Can't change settings,
  reshape navigation, delete pages, or promote themselves.

## For the client — using the CMS

Sign in at `/admin`.

- **Edit a page** → Pages → pick one → change blocks → **Save**. Use **Preview**
  to see it before anyone else does.
- **Add a section** → open a page → *Add block* → pick a type. Drag to reorder.
- **Write a post** → Posts → *Create new*. Set a future date to schedule it.
- **Add an image** → drag it in. Always fill in the description field — it's
  what screen readers and Google read.
- **Publish** → change status from Draft to Published, then Save. Nothing is
  live until you do.

Changes appear on the live site within a few seconds of publishing.
