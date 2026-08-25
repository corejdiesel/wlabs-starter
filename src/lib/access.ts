import type { Access, FieldAccess } from 'payload'

/**
 * Role helpers. The Editor role is the guardrail that lets a client edit
 * content without being able to reshape the site: editors write pages and
 * posts, admins own settings, navigation, redirects and users.
 */
export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => user?.role === 'admin'

/** Any signed-in user (admin or editor). */
export const isSignedIn: Access = ({ req: { user } }) => Boolean(user)

/** Admins manage anyone; editors may only edit their own record. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}

/**
 * Public read, but only published documents. Signed-in users see drafts too,
 * which is what makes preview work without exposing unpublished content.
 */
export const publishedOrSignedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
