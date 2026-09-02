import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage/HomePage.jsx'
import ShinyShowcase from './pages/ShinyShowcase/ShinyShowcase.jsx'
import Admin from './pages/Admin/Admin.jsx'
import PlayerPage from './pages/PlayerPage/PlayerPage.jsx'
import { getRoute, onRouteChange } from './lib/navigation.js'

export default function App() {
  const [route, setRoute] = useState(getRoute())

  useEffect(() => onRouteChange(() => setRoute(getRoute())), [])

  if (route === '/admin') return <Admin />
  if (route === '/showcase') return <ShinyShowcase />
  if (route.startsWith('/player/')) {
    const player = decodeURIComponent(route.slice('/player/'.length))
    return <PlayerPage player={player} />
  }
  return <HomePage />
}
