import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bell, LogOut, Menu, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import AvatarCropper from '../ui/AvatarCropper'
import { useToast } from '../../contexts/ToastContext'

export default function Navbar({ links = [] }) {
  const { profile, signOut, updateAvatar , isOwner } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [cropFile, setCropFile] = useState(null)
  const [cropOpen, setCropOpen] = useState(false)
  const { addToast } = useToast()

  const profilePath = profile?.role === 'owner' ? '/owner/profile' : '/client/profile'
  const notificationsPath = profile?.role === 'owner' ? '/owner/notifications' : '/client/notifications'

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

          <Link
            to={notificationsPath}
            className="relative rounded-xl border border-white/10 p-2 text-text-muted hover:text-text-primary group"
            title="Notifications"
          >
            <motion.div
              animate={unreadCount > 0 ? { rotate: [0, 15, -15, 15, -15, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              <Bell size={16} />
            </motion.div>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-bg-base">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-accent/40 bg-accent/10 text-sm font-bold text-accent"
              onClick={() => setAvatarOpen(v => !v)}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
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
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-bg-base text-xs font-semibold text-accent">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em]">Profile</p>
                      <label className="mt-1 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-accent">
                        Upload avatar
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setCropFile(file)
                              setCropOpen(true)
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <Link
                    to={profilePath}
                    className="block rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text-primary"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Profile settings
                  </Link>
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
              <Link
                to={profilePath}
                className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text-primary"
                onClick={() => setMenuOpen(false)}
              >
                Profile settings
              </Link>
              <Link
                to={notificationsPath}
                className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text-primary"
                onClick={() => setMenuOpen(false)}
              >
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </Link>
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

      <AvatarCropper
        file={cropFile}
        isOpen={cropOpen}
        onClose={() => {
          setCropOpen(false)
          setCropFile(null)
        }}
        onSave={async (blob, filename) => {
          const { error } = await updateAvatar(blob, filename)
          setAvatarOpen(false) // close dropdown when avatar is saved
          if (error) addToast(error.message || 'Avatar upload failed.', 'error')
          else addToast('Avatar updated.', 'success')
        }}
      />
    </motion.nav>
  )
}
