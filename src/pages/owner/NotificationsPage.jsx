import NotificationForm from '../../components/notifications/NotificationForm'
import NotificationLog from '../../components/notifications/NotificationLog'
import { motion } from 'framer-motion'

export default function NotificationsPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-heading text-3xl tracking-widest uppercase">Notifications</h1>
        <p className="mt-2 text-sm text-text-muted">Broadcast messages to your clients or send targeted deals.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <NotificationForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <NotificationLog />
        </motion.div>
      </div>
    </div>
  )
}
