import NotificationLog from '../../components/notifications/NotificationLog'
import { motion } from 'framer-motion'

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header>
        <h1 className="font-heading text-3xl tracking-widest uppercase">Notifications</h1>
        <p className="mt-2 text-sm text-text-muted">Manage your inbox and alerts.</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <NotificationLog />
      </motion.div>
    </div>
  )
}
