import { buildConfig } from 'payload'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { SiteSettings } from '@/globals/SiteSettings'
import { Navigation } from '@/globals/Navigation'
import { Footer } from '@/globals/Footer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const srcDir = path.resolve(dirname, '..')

// Origins allowed to use the auth cookie. Must include every domain the admin
// is served from, or authenticated writes are rejected with "You are not
// allowed to perform this action".
const allowedOrigins = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_SERVER_URL,
      'http://localhost:3000',
      process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
      process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    ].filter(Boolean) as string[],
  ),
)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: srcDir },
    meta: { titleSuffix: ` — ${process.env.NEXT_PUBLIC_SITE_NAME || 'wlabs'}` },
    components: {
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Logo#Icon',
      },
    },
    livePreview: {
      breakpoints: [
        { name: 'mobile', label: 'Mobile', width: 390, height: 844 },
        { name: 'tablet', label: 'Tablet', width: 834, height: 1112 },
        { name: 'desktop', label: 'Desktop', width: 1440, height: 900 },
      ],
    },
  },

  collections: [Pages, Posts, Media, Users],
  globals: [SiteSettings, Navigation, Footer],

  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(srcDir, 'payload/payload-types.ts') },

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Push schema directly in development; production uses committed
    // migrations, so a Vercel build never hangs on an interactive prompt.
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(srcDir, 'migrations'),
  }),

  plugins: [
    // Cloudflare R2. Registers only when a bucket is configured; otherwise
    // uploads fall back to local disk so dev works with no cloud account.
    ...(process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: {
              media: {
                prefix: 'media',
                disableLocalStorage: true,
                generateFileURL: ({ filename, prefix }) => {
                  const base = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT
                  return `${base}/${prefix ? `${prefix}/` : ''}${filename}`
                },
              },
            },
            // Browser PUTs straight to R2 via a presigned URL. Vercel caps
            // function request bodies at 4.5MB — about one phone photo — so
            // routing uploads through the server would reject them. Requires
            // CORS PUT on the bucket for this site's origin.
            clientUploads: true,
            bucket: process.env.S3_BUCKET,
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
              region: 'auto',
              endpoint: process.env.S3_ENDPOINT || '',
            },
          }),
        ]
      : []),

    // Clients build their own forms rather than emailing us to add a field.
    formBuilderPlugin({
      fields: { payment: false },
      formOverrides: { admin: { group: 'Content' } },
      formSubmissionOverrides: { admin: { group: 'Content' } },
    }),

    seoPlugin({
      collections: ['pages', 'posts'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => (doc?.title as string) ?? '',
      generateDescription: ({ doc }) => (doc?.excerpt as string) ?? '',
    }),

    redirectsPlugin({
      collections: ['pages', 'posts'],
      overrides: { admin: { group: 'Settings' } },
    }),
  ],

  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@wlabs.digital',
        defaultFromName: process.env.NEXT_PUBLIC_SITE_NAME || 'wlabs',
        apiKey: process.env.RESEND_API_KEY,
      })
    : undefined,

  cors: allowedOrigins,
  csrf: allowedOrigins,
  sharp,
})
