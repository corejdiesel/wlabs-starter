/**
 * wlabs project provisioner
 *
 *   pnpm provision --client acme --preset modern
 *
 * Collapses the ten-step per-project checklist into one command. Every service
 * below has an API, so the only genuinely manual work left is supplying the
 * client's logo and pointing their own domain at us later.
 *
 * Operator credentials live in .env.provision (never committed):
 *   GITHUB_TOKEN            repo scope, to generate from the template
 *   NEON_API_KEY            console.neon.tech → account settings → API keys
 *   VERCEL_TOKEN            vercel.com/account/tokens
 *   VERCEL_TEAM_ID          optional, if the project belongs to a team
 *   CLOUDFLARE_API_TOKEN    needs Zone:DNS:Edit and Workers R2 Storage:Edit
 *   CLOUDFLARE_ACCOUNT_ID   dash → right-hand sidebar
 *   CLOUDFLARE_ZONE_ID      the wlabs.digital zone
 *   UMAMI_URL / UMAMI_TOKEN shared analytics instance
 *   UPTIMEROBOT_API_KEY     optional; skipped if unset
 *
 * Re-runnable: each step reports if the resource already exists rather than
 * failing, so a part-finished run can be resumed.
 */

const ROOT_DOMAIN = process.env.WLABS_ROOT_DOMAIN ?? 'wlabs.digital'
const TEMPLATE = process.env.WLABS_TEMPLATE ?? 'corejdiesel/wlabs-starter'
const GITHUB_OWNER = TEMPLATE.split('/')[0]

type Ctx = { client: string; preset: string; domain: string; repo: string }

const need = (name: string): string => {
  const v = process.env[name]
  if (!v) throw new Error(`Missing ${name} — see the header of scripts/provision.ts`)
  return v
}

const step = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
  process.stdout.write(`  ${label} … `)
  try {
    const result = await fn()
    console.log('ok')
    return result
  } catch (err) {
    console.log('FAILED')
    throw err
  }
}

async function api(url: string, init: RequestInit & { token?: string } = {}) {
  const { token, ...rest } = init
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(rest.headers ?? {}),
    },
  })
  const text = await res.text()
  const body = text ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(`${res.status} ${url}\n${JSON.stringify(body, null, 2)}`)
  return body
}

/* ── 1. GitHub repo from this template ─────────────────────────────────── */
async function createRepo({ repo }: Ctx) {
  const token = need('GITHUB_TOKEN')
  const existing = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (existing.ok) return { url: `https://github.com/${GITHUB_OWNER}/${repo}`, existed: true }

  const body = await api(`https://api.github.com/repos/${TEMPLATE}/generate`, {
    method: 'POST',
    token,
    headers: { Accept: 'application/vnd.github+json' },
    body: JSON.stringify({ owner: GITHUB_OWNER, name: repo, private: true }),
  })
  return { url: body.html_url as string, existed: false }
}

/* ── 2. Neon database ──────────────────────────────────────────────────── */
async function createNeon({ repo }: Ctx) {
  const body = await api('https://console.neon.tech/api/v2/projects', {
    method: 'POST',
    token: need('NEON_API_KEY'),
    body: JSON.stringify({ project: { name: repo, region_id: 'aws-eu-west-2' } }),
  })
  // Prefer the pooled connection string — Vercel's serverless runtime will
  // otherwise exhaust Postgres connections under any real traffic.
  const pooled =
    body.connection_uris?.find((c: { connection_uri: string }) => c.connection_uri.includes('-pooler'))
      ?.connection_uri ?? body.connection_uris?.[0]?.connection_uri
  if (!pooled) throw new Error('Neon returned no connection string')
  return pooled as string
}

/* ── 3. R2 bucket + CORS (required for clientUploads) ──────────────────── */
async function createBucket({ repo, domain }: Ctx) {
  const account = need('CLOUDFLARE_ACCOUNT_ID')
  const token = need('CLOUDFLARE_API_TOKEN')
  const bucket = `${repo}-media`
  const base = `https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets`

  const res = await fetch(base, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: bucket }),
  })
  if (!res.ok && res.status !== 409) throw new Error(`R2 bucket: ${res.status} ${await res.text()}`)

  // Without this the browser blocks the presigned PUT and uploads fail with a
  // CORS error instead of the 4.5MB limit clientUploads exists to avoid.
  await api(`${base}/${bucket}/cors`, {
    method: 'PUT',
    token,
    body: JSON.stringify({
      rules: [
        {
          allowed: {
            origins: [`https://${domain}`, 'http://localhost:3000'],
            methods: ['GET', 'PUT', 'HEAD'],
            headers: ['*'],
          },
          maxAgeSeconds: 3600,
        },
      ],
    }),
  })
  return bucket
}

/* ── 4. Vercel project, env vars, domain ───────────────────────────────── */
async function createVercel(ctx: Ctx, env: Record<string, string>) {
  const token = need('VERCEL_TOKEN')
  const team = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ''

  const project = await api(`https://api.vercel.com/v11/projects${team}`, {
    method: 'POST',
    token,
    body: JSON.stringify({
      name: ctx.repo,
      framework: 'nextjs',
      gitRepository: { type: 'github', repo: `${GITHUB_OWNER}/${ctx.repo}` },
    }),
  })

  for (const [key, value] of Object.entries(env)) {
    await api(`https://api.vercel.com/v10/projects/${project.id}/env${team}`, {
      method: 'POST',
      token,
      body: JSON.stringify({
        key,
        value,
        type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
        target: ['production', 'preview', 'development'],
      }),
    })
  }

  await api(`https://api.vercel.com/v10/projects/${project.id}/domains${team}`, {
    method: 'POST',
    token,
    body: JSON.stringify({ name: ctx.domain }),
  })

  return project.id as string
}

/* ── 5. Cloudflare DNS ─────────────────────────────────────────────────── */
async function createDns({ client, domain }: Ctx) {
  await api(`https://api.cloudflare.com/client/v4/zones/${need('CLOUDFLARE_ZONE_ID')}/dns_records`, {
    method: 'POST',
    token: need('CLOUDFLARE_API_TOKEN'),
    body: JSON.stringify({
      type: 'CNAME',
      name: client,
      content: 'cname.vercel-dns.com',
      // Proxy stays OFF until Vercel has verified the domain and issued a
      // certificate. Turning it on first is the redirect-loop failure mode.
      proxied: false,
      comment: `wlabs — ${domain}`,
    }),
  })
  return `${domain} → cname.vercel-dns.com (DNS-only for now)`
}

/* ── 6. Umami website ──────────────────────────────────────────────────── */
async function createUmami({ client, domain }: Ctx) {
  const url = process.env.UMAMI_URL
  const token = process.env.UMAMI_TOKEN
  if (!url || !token) return null
  const body = await api(`${url.replace(/\/$/, '')}/api/websites`, {
    method: 'POST',
    token,
    body: JSON.stringify({ name: client, domain }),
  })
  return body.id as string
}

/* ── 7. UptimeRobot monitor ────────────────────────────────────────────── */
async function createMonitor({ client, domain }: Ctx) {
  const key = process.env.UPTIMEROBOT_API_KEY
  if (!key) return null
  const res = await fetch('https://api.uptimerobot.com/v2/newMonitor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: key, friendly_name: client, url: `https://${domain}`, type: 1, interval: 60 }),
  })
  const body = await res.json()
  return body.monitor?.id ?? null
}

/* ── main ──────────────────────────────────────────────────────────────── */
async function main() {
  const args = process.argv.slice(2)
  const arg = (name: string) => {
    const i = args.indexOf(`--${name}`)
    return i === -1 ? undefined : args[i + 1]
  }

  const client = arg('client')
  if (!client || !/^[a-z0-9-]+$/.test(client)) {
    console.error('Usage: pnpm provision --client <slug> [--preset editorial|modern|minimal]')
    process.exit(1)
  }

  const ctx: Ctx = {
    client,
    preset: arg('preset') ?? 'editorial',
    domain: `${client}.${ROOT_DOMAIN}`,
    repo: client,
  }

  console.log(`\nProvisioning ${ctx.domain}\n`)

  const repo = await step('GitHub repo', () => createRepo(ctx))
  const databaseUrl = await step('Neon database', () => createNeon(ctx))
  const bucket = await step('R2 bucket + CORS', () => createBucket(ctx))

  const env: Record<string, string> = {
    DATABASE_URL: databaseUrl,
    PAYLOAD_SECRET: crypto.randomUUID().replace(/-/g, ''),
    CRON_SECRET: crypto.randomUUID().replace(/-/g, ''),
    REVALIDATE_SECRET: crypto.randomUUID().replace(/-/g, ''),
    NEXT_PUBLIC_SERVER_URL: `https://${ctx.domain}`,
    NEXT_PUBLIC_SITE_NAME: client,
    S3_BUCKET: bucket,
    S3_ENDPOINT: `https://${need('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  }

  const umamiId = await step('Umami website', () => createUmami(ctx))
  if (umamiId) {
    env.NEXT_PUBLIC_UMAMI_WEBSITE_ID = umamiId
    env.NEXT_PUBLIC_UMAMI_SRC = `${process.env.UMAMI_URL}/script.js`
  }

  await step('Vercel project + env + domain', () => createVercel(ctx, env))
  await step('Cloudflare DNS', () => createDns(ctx))
  await step('UptimeRobot monitor', () => createMonitor(ctx))

  console.log(`
Done. ${repo.existed ? '(repo already existed)' : ''}

  Repo      ${repo.url}
  Site      https://${ctx.domain}
  Admin     https://${ctx.domain}/admin

Still yours to do:
  1. Add R2 API token secrets to Vercel (S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY)
     — R2 tokens can't be minted via API, so this stays manual.
  2. Clone, run 'pnpm db:migrate' then 'pnpm seed' against DATABASE_URL.
  3. Set the theme preset to '${ctx.preset}' in src/styles/globals.css and tune tokens.
  4. Swap the two SVGs in src/components/admin/Logo.tsx for the client's brand.
  5. Once Vercel shows the domain verified and the cert issued, flip the
     Cloudflare proxy on and set SSL mode to Full (strict).
`)
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exit(1)
})
