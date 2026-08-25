import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Seeds a new project so it looks like a finished site immediately: an admin
 * user, navigation, settings and a home page built from real blocks. A client
 * can be walked through a working site before they have supplied any content,
 * which is usually what the schedule actually waits on.
 */
try {
  const payload = await getPayload({ config })

  const email = process.env.SEED_ADMIN_EMAIL || 'studio@wlabs.digital'
  const password = process.env.SEED_ADMIN_PASSWORD || 'change-me-now'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'New site'

  const { totalDocs } = await payload.count({ collection: 'users' })
  if (totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { name: 'wlabs', email, password, role: 'admin' },
    })
    payload.logger.info(`Created admin ${email} — change this password before handover.`)
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    data: { siteName, tagline: 'A short line about what this business does.' },
  })

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      items: [
        { label: 'About', href: '/about' },
        { label: 'Journal', href: '/posts' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: { text: 'Built by wlabs', links: [{ label: 'Privacy', href: '/privacy' }] },
  })

  const { totalDocs: pageCount } = await payload.count({ collection: 'pages' })
  if (pageCount === 0) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Home',
        slug: 'home',
        _status: 'published',
        layout: [
          {
            blockType: 'hero',
            heading: `${siteName}`,
            subheading: 'Replace this with a sentence describing what you do and who for.',
            layout: 'centered',
            label: 'Get in touch',
            href: '/contact',
          },
          {
            blockType: 'featureGrid',
            heading: 'What we do',
            items: [
              { title: 'First service', body: 'A sentence about this service.' },
              { title: 'Second service', body: 'A sentence about this service.' },
              { title: 'Third service', body: 'A sentence about this service.' },
            ],
          },
          {
            blockType: 'cta',
            heading: 'Ready to talk?',
            body: 'Tell us about the project and we will come back to you.',
            label: 'Contact us',
            href: '/contact',
          },
        ],
      },
    })
    payload.logger.info('Seeded home page.')
  }

  payload.logger.info('Seed complete.')
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
