// Admin API client. All admin actions go through this module so that swapping the
// backend only requires changing VITE_API_BASE_URL - the function signatures and call
// sites elsewhere in the app do not need to change.
//
// Backed by the Worker in worker/src/index.js, which stores the dataset in the
// SHINY_DATA KV namespace and authenticates against the ADMIN_ACCOUNTS secret:
//   POST {API_BASE}/auth/login   { username, password } -> { token }
//   GET  {API_BASE}/shinies                              -> full players dataset
//   POST {API_BASE}/shinies      { player, shiny } (Authorization: Bearer <token>)

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'horde_admin_token'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export function isAuthenticated() {
  return Boolean(sessionStorage.getItem(TOKEN_KEY))
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (res.status === 429) {
    const { error } = await res.json().catch(() => ({}))
    throw new Error(error || 'Too many login attempts. Try again later.')
  }
  if (!res.ok) return false
  const { token } = await res.json()
  sessionStorage.setItem(TOKEN_KEY, token)
  return true
}

export async function addShiny(player, shiny) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return request('/shinies', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ player, shiny }),
  })
}

export async function addShinies(entries) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return request('/shinies/bulk', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ entries }),
  })
}

export async function renamePlayer(player, newPlayer) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return request(`/players/${encodeURIComponent(player)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ player: newPlayer }),
  })
}

export async function deletePlayer(player) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return request(`/players/${encodeURIComponent(player)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function reorderShinies(player, order) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return request(`/players/${encodeURIComponent(player)}/shinies/order`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ order }),
  })
}

export async function updateShiny(player, id, shiny) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return request(`/shinies/${encodeURIComponent(player)}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ shiny }),
  })
}

export async function deleteShiny(player, id) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return request(`/shinies/${encodeURIComponent(player)}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// Fetches the live shiny showcase dataset from the Worker (backed by the SHINY_DATA KV namespace).
export async function fetchShinyData() {
  return request('/shinies', { method: 'GET' })
}

export async function fetchPlayerNames() {
  const players = await fetchShinyData()
  return Object.keys(players).sort((a, b) => a.localeCompare(b))
}

export async function fetchPokemonNames() {
  const res = await fetch(`${import.meta.env.BASE_URL}data/pokemon-names.json`)
  return [...new Set(await res.json())]
}

// Home page blog-style posts (events, social media shout-outs, etc.).
export async function fetchPosts() {
  return request('/posts', { method: 'GET' })
}

export async function createPost(post) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return request('/posts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(post),
  })
}

export async function updatePost(id, post) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return request(`/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(post),
  })
}

export async function deletePost(id) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return request(`/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

