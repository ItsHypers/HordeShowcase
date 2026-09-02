// Best-effort localStorage cache for GitHub Pages (static hosting, no server-side cache control).
// Callers should render cached data immediately, then overwrite once a fresh fetch resolves
// (stale-while-revalidate) so repeat visits feel instant even though the JS still refetches.
const CACHE_PREFIX = 'horde_cache_'

export function readCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    return raw ? JSON.parse(raw).data : null
  } catch {
    return null
  }
}

export function writeCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, cachedAt: Date.now() }))
  } catch {
    // Storage full/unavailable - caching is best-effort only.
  }
}
