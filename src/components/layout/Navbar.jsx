import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bell, LogOut, Menu, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar({ links = [] }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [hasNotification] = useState(false)

  const initials = useMemo(() => {
    const parts = (profile?.full_name ?? '').trim().split(' ').filter(Boolean)
    return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'AL'
  }, [profile?.full_name])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <motion.nav
      className="sticky top-0 z-50 border-b border-white/10 bg-bg-base/80 backdrop-blur"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        {/* Logo */}
        <Link to="/" className="font-heading text-2xl tracking-[0.2em]">
          AUTO<span className="text-accent">·</span>LOC
        </Link>

        {/* Desktop links */}
        <div className="relative hidden flex-1 items-center gap-2 md:flex">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition hover:text-text-primary"
            >
              {link.icon && <link.icon size={16} />}
              {link.label}
              {location.pathname === link.to && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-accent"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden flex-col items-end text-right md:flex">
            <span className="text-sm font-semibold text-text-primary">{profile?.full_name}</span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-accent">{profile?.role}</span>
          </div>

          <motion.button
            className="rounded-xl border border-white/10 p-2 text-text-muted hover:text-text-primary"
            animate={hasNotification ? { rotate: [0, 15, -15, 0] } : undefined}
            transition={{ duration: 0.5 }}
            title="Notifications"
          >
            <Bell size={16} />
          </motion.button>

          <div className="relative">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-sm font-bold text-accent"
              onClick={() => setAvatarOpen(v => !v)}
            >
              {initials}
            </button>
            <AnimatePresence>
              {avatarOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-bg-card p-2 shadow-2xl"
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to="/dashboard"
                    className="block rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text-primary"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
                    onClick={handleSignOut}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-text-primary md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="border-t border-white/10 bg-bg-base/90 px-6 py-4 md:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="flex flex-col gap-2">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
                onClick={handleSignOut}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
