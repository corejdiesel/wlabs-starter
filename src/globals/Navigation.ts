import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/lib/access'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: { group: 'Settings' },
  // Structural — admins only, so an editor can't reshape the site's nav.
  access: { read: () => true, update: isAdmin },
  fields: [
    {
      name: 'items',
      type: 'array',
      maxRows: 7,
      admin: { description: 'Up to seven top-level links. More than that and a menu stops being scannable.' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true, admin: { description: 'e.g. /about' } },
      ],
    },
  ],
}
