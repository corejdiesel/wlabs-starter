import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/lib/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  // Editors can read settings (the front end needs them) but not change them.
  access: { read: () => true, update: isAdmin },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'New site' },
    { name: 'tagline', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Shown when a page is shared on social media and has no image of its own.' },
    },
    {
      type: 'collapsible',
      label: 'Contact',
      fields: [
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'textarea' },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: ['Instagram', 'LinkedIn', 'Facebook', 'X', 'YouTube', 'TikTok'],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
