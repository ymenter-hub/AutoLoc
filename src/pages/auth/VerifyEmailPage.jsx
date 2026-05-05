import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-bg-base px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          className="w-full rounded-2xl border border-white/10 bg-bg-card p-8 text-center"
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

        <div className="relative hidden h-full overflow-hidden rounded-2xl border border-white/10 bg-bg-card md:block">
          <video
            className="h-full w-full object-cover"
            src="/car.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-base/10 via-bg-base/40 to-bg-base/80" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Secure access</p>
            <p className="mt-2 text-lg font-semibold">Verify once, unlock everything.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
