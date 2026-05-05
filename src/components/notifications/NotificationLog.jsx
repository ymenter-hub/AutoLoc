import { useNotifications } from '../../contexts/NotificationContext'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Info, Tag, AlertTriangle, User } from 'lucide-react'

export default function NotificationLog() {
  const { notifications, loading } = useNotifications()

  const getTypeStyle = (type) => {
    switch (type) {
      case 'info':  return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: Info }
      case 'deal':  return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', icon: Tag }
      case 'alert': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: AlertTriangle }
      default:      return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', icon: Info }
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 w-full rounded-2xl skeleton" />
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted">
        <Info size={40} className="mb-4 opacity-20" />
        <p>No notifications sent yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl tracking-widest uppercase mb-6">Inbox</h2>
      <AnimatePresence initial={false}>
        {notifications.map((n) => {
          const style = getTypeStyle(n.type)
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-bg-card p-5 transition-all hover:border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-xl p-3 ${style.bg} ${style.text}`}>
                  <style.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${style.border} ${style.text}`}>
                      {n.type}
                    </span>
                    <span className="text-[10px] text-text-muted whitespace-nowrap">
                      {format(new Date(n.created_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary mb-3 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted bg-white/5 w-fit px-2 py-1 rounded-lg">
                    <User size={12} />
                    <span>Notification Received</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
