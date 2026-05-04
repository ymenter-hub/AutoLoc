import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar({ links = [] }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          AUTO<span className={styles.dot}>·</span>LOC
        </Link>

        {/* Desktop links */}
        <div className={styles.links}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.link} ${location.pathname === link.to ? styles.active : ''}`}
            >
              {link.icon && <link.icon size={16} />}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className={styles.right}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{profile?.full_name}</span>
            <span className={styles.userRole}>{profile?.role}</span>
          </div>
          <button className={styles.signOut} onClick={handleSignOut} title="Sign out">
            <LogOut size={16} />
          </button>
          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button className={styles.mobileSignOut} onClick={handleSignOut}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
