import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(form)
    setLoading(false)
    if (error) {
      setError(error.message === 'Email not confirmed'
        ? 'Please verify your email before signing in.'
        : 'Invalid email or password.')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 py-16">
      <motion.div
        className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-bg-card p-8"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Link to="/" className="font-heading text-2xl tracking-[0.2em]">AUTO<span className="text-accent">·</span>LOC</Link>
        <h1 className="mt-6 font-heading text-3xl tracking-widest">Welcome back</h1>
        <p className="mt-2 text-sm text-text-muted">Sign in to your account</p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handle}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handle}
            placeholder="••••••••"
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

          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-accent">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}
