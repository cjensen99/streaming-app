/**
 * A short, stable, non-cryptographic hash (32-bit FNV-1a, base 36). Used for ids derived from
 * URLs and for compact cache keys; never for anything security-related.
 */
export function stableHash(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}
