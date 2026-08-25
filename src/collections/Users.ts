import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrSelf, isAdminFieldLevel } from '@/lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email', defaultColumns: ['name', 'email', 'role'], group: 'Settings' },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      // Only admins may change roles — otherwise an editor could promote themselves.
      access: { create: isAdminFieldLevel, update: isAdminFieldLevel },
      options: [
        { label: 'Admin — full access, including settings and users', value: 'admin' },
        { label: 'Editor — pages, posts and media only', value: 'editor' },
      ],
    },
  ],
}
