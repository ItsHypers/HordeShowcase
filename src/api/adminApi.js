// Admin API client. All admin actions go through this module so that swapping the
// backend for a real Cloudflare Worker later only requires changing API_BASE (or
// setting VITE_API_BASE_URL) and deleting the mock fallbacks below - the function
// signatures and call sites elsewhere in the app do not need to change.
//
// Expected future Worker routes:
//   POST {API_BASE}/auth/login   { username, password } -> { token }
//   POST {API_BASE}/shinies      { player, shiny } (Authorization: Bearer <token>)

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'horde_admin_token'
const MOCK_SUBMISSIONS_KEY = 'horde_mock_submissions'

// Temporary hardcoded credentials for local testing until the Worker's auth endpoint exists.
const MOCK_CREDENTIALS = { username: 'user', password: 'pass' }

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
  try {
    const { token } = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    sessionStorage.setItem(TOKEN_KEY, token)
    return true
  } catch {
    // No backend deployed yet - fall back to the mock credentials for local testing.
    if (username === MOCK_CREDENTIALS.username && password === MOCK_CREDENTIALS.password) {
      sessionStorage.setItem(TOKEN_KEY, 'mock-token')
      return true
    }
    return false
  }
}

export async function addShiny(player, shiny) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  try {
    return await request('/shinies', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ player, shiny }),
    })
  } catch {
    // No backend deployed yet - stash the submission in localStorage so the form
    // is still testable end-to-end. Remove once addShiny hits the real Worker.
    const pending = JSON.parse(localStorage.getItem(MOCK_SUBMISSIONS_KEY) || '[]')
    pending.push({ player, shiny, submittedAt: new Date().toISOString() })
    localStorage.setItem(MOCK_SUBMISSIONS_KEY, JSON.stringify(pending))
    return { ok: true, mock: true }
  }
}

export async function fetchPlayerNames() {
  const res = await fetch(`${import.meta.env.BASE_URL}data/players.json`)
  const players = await res.json()
  return Object.keys(players).sort((a, b) => a.localeCompare(b))
}

export async function fetchPokemonNames() {
  const res = await fetch(`${import.meta.env.BASE_URL}data/pokemon-names.json`)
  return res.json()
}

// Shinies added while no real backend exists live here. useShinyData reads this
// to merge them into the showcase; delete this once addShiny hits the real Worker.
export function getMockSubmissions() {
  return JSON.parse(localStorage.getItem(MOCK_SUBMISSIONS_KEY) || '[]')
}

