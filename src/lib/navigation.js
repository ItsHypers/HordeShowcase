// Minimal client-side router: works with the GitHub Pages 404.html redirect trick
// already used for /admin, and notifies listeners on both back/forward and pushState navigation.
const NAVIGATE_EVENT = 'horde-navigate'

export function getRoute() {
  const base = import.meta.env.BASE_URL
  let path = window.location.pathname
  if (base !== '/' && path.startsWith(base)) path = `/${path.slice(base.length)}`
  return path.replace(/\/+$/, '') || '/'
}

export function navigate(path) {
  const base = import.meta.env.BASE_URL
  const href = base === '/' ? path : `${base.replace(/\/$/, '')}${path}`
  window.history.pushState(null, '', href)
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
}

export function onRouteChange(callback) {
  window.addEventListener('popstate', callback)
  window.addEventListener(NAVIGATE_EVENT, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(NAVIGATE_EVENT, callback)
  }
}

export function playerPath(player) {
  return `/player/${encodeURIComponent(player)}`
}

export function playerHref(player) {
  const base = import.meta.env.BASE_URL
  const path = playerPath(player)
  return base === '/' ? path : `${base.replace(/\/$/, '')}${path}`
}
