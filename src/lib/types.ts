/**
 * Minimal structural shapes for rendering. `pnpm generate:types` produces the
 * full generated types from the Payload config; these keep the front end
 * compiling before that has been run (and on a clean clone).
 */
export type MediaDoc = {
  id: string
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  sizes?: Record<string, { url?: string | null; width?: number | null; height?: number | null }>
}

export type BlockData = { blockType: string; id?: string; [key: string]: unknown }

export const asMedia = (v: unknown): MediaDoc | null =>
  v && typeof v === 'object' && 'url' in (v as object) ? (v as MediaDoc) : null
