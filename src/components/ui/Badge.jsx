import styles from './Badge.module.css'

export function Badge({ status }) {
  const map = {
    pending:   { label: 'Pending',   cls: styles.yellow },
    confirmed: { label: 'Confirmed', cls: styles.green  },
    rejected:  { label: 'Rejected',  cls: styles.red    },
    cancelled: { label: 'Cancelled', cls: styles.muted  },
    available: { label: 'Available', cls: styles.green  },
    unavailable:{ label: 'Unavailable', cls: styles.red },
  }
  const { label, cls } = map[status] ?? { label: status, cls: styles.muted }
  return <span className={`${styles.badge} ${cls}`}>{label}</span>
}
