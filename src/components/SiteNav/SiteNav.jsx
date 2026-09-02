import { navigate } from '../../lib/navigation.js'
import styles from './SiteNav.module.css'

const TABS = [
  { path: '/', label: 'Home' },
  { path: '/showcase', label: 'Shiny Showcase' },
]

export default function SiteNav({ active }) {
  return (
    <nav className={styles.nav}>
      {TABS.map((tab) => (
        <button
          key={tab.path}
          type="button"
          className={`${styles.tab} ${active === tab.path ? styles.tabActive : ''}`}
          onClick={() => navigate(tab.path)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
