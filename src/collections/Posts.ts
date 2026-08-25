import type { CollectionConfig } from 'payload'
import { isAdmin, isSignedIn, publishedOrSignedIn } from '@/lib/access'
import { blocks } from '@/blocks'
import { revalidatePost } from '@/lib/revalidate'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'updatedAt'],
    group: 'Content',
    livePreview: { url: ({ data }) => `${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${data?.slug ?? ''}` },
  },
  versions: { drafts: { autosave: { interval: 400 } }, maxPerDoc: 50 },
  access: { read: publishedOrSignedIn, create: isSignedIn, update: isSignedIn, delete: isAdmin },
  hooks: { afterChange: [revalidatePost] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' } },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Set a future date to schedule this post.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    { name: 'excerpt', type: 'textarea', admin: { description: 'Shown in listings and search results.' } },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'layout', type: 'blocks', required: true, minRows: 1, blocks },
  ],
}
