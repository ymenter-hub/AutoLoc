import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export function Badge({ status }) {
  return <StatusBadge status={status} />
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', tone: 'text-accent bg-accent/10', pulse: true },
    confirmed: { label: 'Confirmed', tone: 'text-success bg-success/10', icon: Check },
    rejected: { label: 'Rejected', tone: 'text-danger bg-danger/10', shake: true },
    cancelled: { label: 'Cancelled', tone: 'text-danger bg-danger/10', strike: true },
    completed: { label: 'Completed', tone: 'text-text-muted bg-white/5' },
    available: { label: 'Available', tone: 'text-success bg-success/10' },
    unavailable: { label: 'Unavailable', tone: 'text-danger bg-danger/10' },
  }

  const cfg = map[status] ?? { label: status, tone: 'text-text-muted bg-white/5' }
  const Icon = cfg.icon

  return (
    <motion.span
      className={[
        'relative inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest',
        cfg.tone,
      ].join(' ')}
      animate={cfg.shake ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
      transition={cfg.shake ? { duration: 0.35 } : undefined}
    >
      {cfg.pulse && (
        <motion.span
          className="h-2 w-2 rounded-full bg-accent"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
      {Icon && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          <Icon size={12} />
        </motion.span>
      )}
      <span className="relative">
        {cfg.label}
        {cfg.strike && (
          <motion.span
            className="absolute left-0 top-1/2 h-px w-full bg-danger"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: 'left' }}
          />
        )}
      </span>
    </motion.span>
  )
}
