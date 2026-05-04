import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-bg-base px-6 py-16">
      <motion.div
        className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-bg-card p-8 text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
          <MailCheck size={40} />
        </div>
        <h1 className="font-heading text-3xl tracking-widest">Check your inbox</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-text-muted">
          We sent a verification link to your email. Click it to activate your account and start using Auto-Loc.
        </p>
        <p className="mt-8 text-sm text-text-muted">
          Already verified?{' '}
          <Link to="/login" className="font-semibold text-accent">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
