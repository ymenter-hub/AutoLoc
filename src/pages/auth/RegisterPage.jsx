import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import styles from './Auth.module.css'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'client',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/verify-email')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>AUTO<span>·</span>LOC</Link>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Get started in seconds</p>

        {/* Role selector */}
        <div className={styles.roleToggle}>
          <button
            type="button"
            className={`${styles.roleBtn} ${form.role === 'client' ? styles.roleActive : ''}`}
            onClick={() => setForm(f => ({ ...f, role: 'client' }))}
          >
            I'm a Client
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${form.role === 'owner' ? styles.roleActive : ''}`}
            onClick={() => setForm(f => ({ ...f, role: 'owner' }))}
          >
            I'm an Agency Owner
          </button>
        </div>

        <form onSubmit={submit} className={styles.form}>
          <Input
            label="Full Name"
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handle}
            placeholder="John Doe"
            required
          />
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
            placeholder="Min. 6 characters"
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" fullWidth loading={loading} size="lg">
            Create Account
          </Button>
        </form>

        <p className={styles.switch}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
