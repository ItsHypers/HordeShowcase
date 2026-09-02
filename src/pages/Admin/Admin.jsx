import { useState } from 'react'
import { isAuthenticated, logout } from '../../api/adminApi.js'
import LoginForm from './LoginForm.jsx'
import AddShinyForm from './AddShinyForm.jsx'
import BulkAddForm from './BulkAddForm.jsx'
import EditPlayerForm from './EditPlayerForm.jsx'
import styles from './Admin.module.css'

const TABS = [
  { key: 'single', label: 'Add a Shiny' },
  { key: 'bulk', label: 'Bulk Add' },
  { key: 'edit', label: 'Edit Player' },
]

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated())
  const [activeTab, setActiveTab] = useState('single')

  const handleLogout = () => {
    logout()
    setLoggedIn(false)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Horde Admin</h1>
        {loggedIn && (
          <div className={styles.headerActions}>
            <a className={styles.showcaseButton} href={import.meta.env.BASE_URL}>
              Showcase
            </a>
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              Log Out
            </button>
          </div>
        )}
      </header>

      {loggedIn ? (
        <>
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === 'single' && <AddShinyForm />}
          {activeTab === 'bulk' && <BulkAddForm />}
          {activeTab === 'edit' && <EditPlayerForm />}
        </>
      ) : (
        <LoginForm onLoggedIn={() => setLoggedIn(true)} />
      )}
    </div>
  )
}

