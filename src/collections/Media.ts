import type { CollectionConfig } from 'payload'
import { isSignedIn } from '@/lib/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: () => true, create: isSignedIn, update: isSignedIn, delete: isSignedIn },
  upload: {
    // Generated on upload; the front end picks the closest size.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 900 },
      { name: 'hero', width: 1920 },
    ],
    focalPoint: true,
    mimeTypes: ['image/*', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the image for screen readers and search engines. For decorative images, a short description is still better than nothing.',
      },
    },
  ],
}
