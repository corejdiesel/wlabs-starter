import type { CollectionConfig } from 'payload'
import { isAdmin, isSignedIn, publishedOrSignedIn } from '@/lib/access'
import { blocks } from '@/blocks'
import { revalidatePage } from '@/lib/revalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
    livePreview: {
      url: ({ data }) => `${process.env.NEXT_PUBLIC_SERVER_URL}/${data?.slug === 'home' ? '' : data?.slug ?? ''}`,
    },
  },
  versions: { drafts: { autosave: { interval: 400 } }, maxPerDoc: 50 },
  access: {
    read: publishedOrSignedIn,
    create: isSignedIn,
    update: isSignedIn,
    // Only admins delete pages — stops an editor removing the homepage.
    delete: isAdmin,
  },
  hooks: { afterChange: [revalidatePage] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'The URL for this page. Use "home" for the front page.',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks,
      admin: { description: 'Build the page by adding blocks. Drag to reorder.' },
    },
  ],
}
