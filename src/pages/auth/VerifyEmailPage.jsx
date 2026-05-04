import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import styles from './Auth.module.css'

export default function VerifyEmailPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ textAlign: 'center' }}>
        <div className={styles.verifyIcon}>
          <MailCheck size={40} color="var(--red)" />
        </div>
        <h1 className={styles.title}>Check your inbox</h1>
        <p className={styles.sub} style={{ maxWidth: 320, margin: '12px auto 0' }}>
          We sent a verification link to your email. Click it to activate your account and start using Auto-Loc.
        </p>
        <p className={styles.switch} style={{ marginTop: 32 }}>
          Already verified?{' '}
          <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
