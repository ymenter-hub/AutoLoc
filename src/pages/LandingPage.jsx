import { Link } from 'react-router-dom'
import { Car, ShieldCheck, Zap, Users, LayoutDashboard, LogOut } from 'lucide-react'
import { motion, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export default function LandingPage() {
  const { session, profile, signOut } = useAuth()
  const title = 'AUTO-LOC'

  const [stats, setStats] = useState([
    { label: 'Total Cars', value: 0 },
    { label: 'Active Clients', value: 0 },
    { label: 'Monthly Rentals', value: 0 },
  ])
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  useEffect(() => {
    async function loadLandingData() {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const [vehiclesRes, clientsRes, rentalsRes, featuredRes] = await Promise.all([
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('reservations').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo),
        supabase
          .from('vehicles')
          .select('id, brand, model, daily_price, fuel_type, seats, transmission, image_url, is_available')
          .order('created_at', { ascending: false })
          .limit(3),
      ])

      setStats([
        { label: 'Total Cars', value: vehiclesRes.count ?? 0 },
        { label: 'Active Clients', value: clientsRes.count ?? 0 },
        { label: 'Monthly Rentals', value: rentalsRes.count ?? 0 },
      ])

      setFeatured(featuredRes.data ?? [])
      setLoadingFeatured(false)
    }

    loadLandingData()
  }, [])

  // Initialize n8n chat widget once on mount
  useEffect(() => {
    createChat({
      webhookUrl: 'https://tawat11.app.n8n.cloud/webhook/9607bca5-88d0-4988-9409-1ec1477962c9/chat',
      target: '#n8n-chat-container',
      mode: 'window',
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId',
      defaultLanguage: 'en',
      initialMessages: ['Hi there! 👋 I\'m the Auto-Loc assistant. Ask me about our vehicles, pricing, or bookings!'],
      i18n: {
        en: {
          title: 'Auto-Loc Assistant ✨',
          subtitle: 'Powered by Gemini Flash',
          footer: '',
          getStarted: 'New Conversation',
          inputPlaceholder: 'Ask about cars, pricing, availability...',
        },
      },
    })
  }, [])

  function StatCounter({ value }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
      const controls = animate(0, value, {
        duration: 1.2,
        ease: 'easeOut',
        onUpdate: v => setCount(Math.round(v)),
      })
      return () => controls.stop()
    }, [value])

    return <span>{count}</span>
  }

  const heroVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.04 },
    },
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Nav */}
      <motion.nav
        className="sticky top-0 z-40 border-b border-white/10 bg-bg-base/70 backdrop-blur"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="font-heading text-2xl tracking-[0.2em]">
            AUTO<span className="text-accent">·</span>LOC
          </span>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <div className="hidden flex-col items-end text-right md:flex">
                  <span className="text-sm font-semibold">{profile?.full_name}</span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-accent">{profile?.role}</span>
                </div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-bg-base"
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-text-muted hover:text-text-primary"
                  onClick={signOut}
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-text-muted hover:text-text-primary">Sign In</Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-bg-base"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mesh-bg animate-hue absolute inset-0" />
        <motion.video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
          src="/car.mp4"
          autoPlay
          muted
          loop
          playsInline
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base/40 via-bg-base/70 to-bg-base" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-dim px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-accent">
            Vehicle Rental Platform
          </div>

          <motion.h1
            className="text-glow font-heading text-6xl tracking-[0.3em] sm:text-7xl md:text-8xl"
            variants={heroVariants}
            initial="hidden"
            animate="show"
          >
            {title.split('').map((letter, index) => (
              <motion.span
                key={`${letter}-${index}`}
                className="inline-block"
                variants={letterVariants}
              >
                {letter}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-base text-text-muted sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            Browse premium vehicles, book instantly, and manage your rentals in one high-performance platform.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.6 }}
          >
            {session ? (
              <Link to="/dashboard" className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-bg-base">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/register?role=client" className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-bg-base">Find a Car</Link>
                <Link to="/register?role=owner" className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-text-primary">List Your Fleet →</Link>
              </>
            )}
          </motion.div>

          <motion.div
            className="mt-10 flex items-center gap-2 rounded-2xl border border-white/10 bg-bg-card/70 px-4 py-2 text-sm text-text-muted"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Car size={18} className="text-accent" />
            Instant bookings. Zero friction.
          </motion.div>

          <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(stat => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-bg-card/60 px-4 py-4 text-left">
                <div className="text-2xl font-heading tracking-widest text-accent">
                  <StatCounter value={stat.value} />
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Highlights */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-3xl tracking-[0.2em]">Featured Fleet</h2>
          <span className="text-sm text-text-muted">Premium selection</span>
        </div>
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {loadingFeatured && Array.from({ length: 3 }).map((_, index) => (
            <div key={`featured-skel-${index}`} className="rounded-2xl border border-white/10 bg-bg-card p-5">
              <div className="h-32 w-full rounded-xl skeleton" />
              <div className="mt-4 h-4 w-40 rounded skeleton" />
              <div className="mt-2 h-3 w-28 rounded skeleton" />
              <div className="mt-5 h-9 w-full rounded-xl skeleton" />
            </div>
          ))}

          {!loadingFeatured && featured.length === 0 && (
            <div className="col-span-3 rounded-2xl border border-white/10 bg-bg-card p-6 text-center text-text-muted">
              No vehicles listed yet. Add your first car to showcase it here.
            </div>
          )}

          {!loadingFeatured && featured.map((v, index) => (
            <motion.div
              key={v.id}
              className="group rounded-2xl border border-transparent bg-bg-card p-5 transition"
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px #E8B84B15', borderColor: '#E8B84B44' }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="relative h-32 w-full overflow-hidden rounded-xl bg-bg-base/60">
                {v.image_url ? (
                  <img src={v.image_url} alt={`${v.brand} ${v.model}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-text-muted">
                    <Car size={32} />
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{v.brand} {v.model}</h3>
                  <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{v.fuel_type} · {v.transmission}</p>
                </div>
                <motion.span
                  className={[
                    'rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]',
                    v.is_available ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
                  ].join(' ')}
                  animate={v.is_available ? { scale: [1, 1.15, 1] } : undefined}
                  transition={v.is_available ? { repeat: Infinity, duration: 2 } : undefined}
                >
                  {v.is_available ? 'Available' : 'Unavailable'}
                </motion.span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
                <span>{v.seats} seats</span>
                <span className="text-base font-semibold text-text-primary">{v.daily_price} DZD/day</span>
              </div>
              <motion.button
                className="mt-5 w-full rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-bg-base"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Book Now
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 md:grid-cols-4">
        {[
          { icon: Car, title: 'Browse & Reserve', desc: 'Browse available vehicles from local agencies and reserve in seconds.' },
          { icon: ShieldCheck, title: 'Secure & Verified', desc: 'License upload verification ensures every rental is safe and documented.' },
          { icon: Zap, title: 'Instant Decisions', desc: 'Agency owners confirm or reject in one click. No back-and-forth.' },
          { icon: Users, title: 'Two-sided Platform', desc: 'Built for both clients and rental agency owners with dedicated dashboards.' },
        ].map(f => (
          <div key={f.title} className="rounded-2xl border border-white/10 bg-bg-card p-5">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <f.icon size={20} />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em]">{f.title}</h3>
            <p className="mt-3 text-sm text-text-muted">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span className="font-heading tracking-[0.2em]">AUTO<span className="text-accent">·</span>LOC</span>
          <span className="text-xs uppercase tracking-[0.3em] text-text-muted">© 2026 Auto-Loc. Built with Supabase & Vercel.</span>
        </div>
      </footer>

      {/* n8n Chat Widget Mount Point */}
      <div id="n8n-chat-container" />
    </div>
  )
}
