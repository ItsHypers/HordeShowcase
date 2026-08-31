import { useEffect, useState } from 'react'
import ShinyShowcase from './pages/ShinyShowcase/ShinyShowcase.jsx'
import Admin from './pages/Admin/Admin.jsx'

// Strips the vite base path so route checks below work in both dev ("/") and
// the GitHub Pages build (e.g. "/HordeShowcase/").
function getRoute() {
  const base = import.meta.env.BASE_URL
  let path = window.location.pathname
  if (base !== '/' && path.startsWith(base)) path = `/${path.slice(base.length)}`
  return path.replace(/\/+$/, '') || '/'
}

export default function App() {
  const [route, setRoute] = useState(getRoute())

  useEffect(() => {
    const onPopState = () => setRoute(getRoute())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (route === '/admin') return <Admin />
  return <ShinyShowcase />
}
