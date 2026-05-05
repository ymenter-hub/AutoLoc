import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    agencyName: '',
    email: '',
    password: '',
    role: 'client',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const stepVariants = {
    enter: dir => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: dir => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
  }

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      role: form.role,
      agencyName: form.role === 'owner' ? form.agencyName : null,
    })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/verify-email')
  }

  function nextStep() {
    setDirection(1)
    setStep(1)
  }

  function prevStep() {
    setDirection(-1)
    setStep(0)
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 py-16">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          className="w-full rounded-2xl border border-white/10 bg-bg-card p-8"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Link to="/" className="font-heading text-2xl tracking-[0.2em]">AUTO<span className="text-accent">·</span>LOC</Link>
          <h1 className="mt-6 font-heading text-3xl tracking-widest">Create account</h1>
          <p className="mt-2 text-sm text-text-muted">Get started in seconds</p>

        <div className="mt-6 rounded-xl border border-white/10 bg-bg-base/40 p-2">
          <div className="grid grid-cols-2 gap-2">
            {['client', 'owner'].map(role => (
              <button
                key={role}
                type="button"
                className={[
                  'rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition',
                  form.role === role ? 'bg-accent text-bg-base' : 'text-text-muted hover:bg-white/5',
                ].join(' ')}
                onClick={() => setForm(f => ({ ...f, role }))}
              >
                {role === 'client' ? "I'm a Client" : "I'm an Agency Owner"}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <AnimatePresence custom={direction} mode="wait">
            {step === 0 ? (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                <Input
                  label="Full Name"
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handle}
                  placeholder=""
                  required
                />
                {form.role === 'owner' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      label="Agency Name"
                      id="agencyName"
                      name="agencyName"
                      value={form.agencyName}
                      onChange={handle}
                      placeholder=""
                      required={form.role === 'owner'}
                    />
                  </motion.div>
                )}
                <Button type="button" fullWidth size="lg" onClick={nextStep}>
                  Continue
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                <Input
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handle}
                  placeholder=""
                  required
                />
                <Input
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handle}
                  placeholder=""
                  required
                />

                {error && (
                  <motion.p
                    className="rounded-xl border border-danger/60 bg-danger/10 px-4 py-3 text-xs text-danger"
                    animate={{ x: [0, -6, 6, -4, 4, 0] }}
                    transition={{ duration: 0.35 }}
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="submit" fullWidth loading={loading} size="lg">
                    Create Account
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{' '}
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
            <p className="text-xs uppercase tracking-[0.4em] text-text-muted">Launch fast</p>
            <p className="mt-2 text-lg font-semibold">Set up your fleet and start earning.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
