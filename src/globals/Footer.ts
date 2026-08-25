import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/lib/access'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: { group: 'Settings' },
  access: { read: () => true, update: isAdmin },
  fields: [
    { name: 'text', type: 'textarea', admin: { description: 'Short line shown above the copyright.' } },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
  ],
}
