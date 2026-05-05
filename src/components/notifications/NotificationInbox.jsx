import { useNotifications } from '../../contexts/NotificationContext'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Info, Tag, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react'

export default function NotificationInbox() {
  const { notifications, markAsRead, clearAll, loading } = useNotifications()

  const getTypeStyle = (type) => {
    switch (type) {
      case 'info':  return { accent: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: Info }
      case 'deal':  return { accent: 'bg-green-500', bg: 'bg-green-500/10', text: 'text-green-400', icon: Tag }
      case 'alert': return { accent: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400', icon: AlertTriangle }
      default:      return { accent: 'bg-gray-500', bg: 'bg-gray-500/10', text: 'text-gray-400', icon: Info }
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 w-full rounded-2xl skeleton" />
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted text-center">
        <div className="mb-6 rounded-full bg-white/5 p-6">
          <Info size={48} className="opacity-20" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">Inbox is empty</h3>
        <p className="max-w-xs text-sm">You don't have any notifications at the moment. Check back later for deals and updates!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl tracking-widest uppercase">My Messages</h2>
        <button
          onClick={clearAll}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400 transition hover:text-red-300"
        >
          <Trash2 size={14} />
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {notifications.map((n) => {
            const style = getTypeStyle(n.type)
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`group relative overflow-hidden rounded-2xl border bg-bg-card p-5 transition-all ${
                  n.is_read 
                    ? 'border-white/5 opacity-60' 
                    : 'border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]'
                }`}
              >
                {/* Glowing Left Border for Unread */}
                {!n.is_read && (
                  <motion.div
                    layoutId={`glow-${n.id}`}
                    className={`absolute left-0 top-0 h-full w-1 ${style.accent}`}
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    style={{ boxShadow: `0 0 15px ${style.accent}` }}
                  />
                )}

                <div className="flex items-start gap-4">
                  <div className={`rounded-xl p-3 ${style.bg} ${style.text} shrink-0`}>
                    <style.icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Garage Owner</span>
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="text-[10px] text-text-muted">
                          {format(new Date(n.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-text-primary leading-relaxed pr-8">
                      {n.message}
                    </p>
                  </div>

                  {n.is_read && (
                    <div className="text-success opacity-40">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
