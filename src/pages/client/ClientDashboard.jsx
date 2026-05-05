import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { animate, motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Badge } from '../../components/ui/Badge'

export default function ClientDashboard() {
  const { profile } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('reservations')
        .select('*, vehicle:vehicles(brand, model, image_url)')
        .order('created_at', { ascending: false })
        .limit(5)
      setReservations(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const counts = {
    pending:   reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    rejected:  reservations.filter(r => r.status === 'rejected').length,
  }

  function StatCard({ icon: Icon, value, label, color }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
      const controls = animate(0, value, {
        duration: 0.9,
        ease: 'easeOut',
        onUpdate: v => setCount(Math.round(v)),
      })
      return () => controls.stop()
    }, [value])

    return (
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-bg-card p-5"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="absolute left-0 top-0 h-full w-1 bg-accent"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6 }}
          style={{ transformOrigin: 'top' }}
        />
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ rotate: 15 }} className={`rounded-xl bg-white/5 p-3 ${color}`}>
            <Icon size={20} />
          </motion.div>
          <div>
            <span className="block font-heading text-3xl tracking-widest text-text-primary">{count}</span>
            <span className="text-xs uppercase tracking-[0.3em] text-text-muted">{label}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-widest">Good to see you, {profile?.full_name?.split(' ')[0]} 👋</h1>
          <p className="mt-2 text-sm text-text-muted">Here's a summary of your rental activity.</p>
        </div>
        <Link to="/client/vehicles" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-bg-base">Browse Cars →</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Clock} value={counts.pending} label="Pending" color="text-accent" />
        <StatCard icon={CheckCircle2} value={counts.confirmed} label="Confirmed" color="text-success" />
        <StatCard icon={XCircle} value={counts.rejected} label="Rejected" color="text-danger" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          to="/client/vehicles"
          className="group rounded-2xl border border-white/10 bg-bg-card p-5 transition hover:border-accent/40"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Quick action</p>
          <h3 className="mt-2 text-lg font-semibold">Find a car today</h3>
          <p className="mt-1 text-sm text-text-muted">Explore new arrivals and premium vehicles.</p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-accent">Browse Fleet →</span>
        </Link>
        <Link
          to="/client/reservations"
          className="group rounded-2xl border border-white/10 bg-bg-card p-5 transition hover:border-accent/40"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Quick action</p>
          <h3 className="mt-2 text-lg font-semibold">Manage bookings</h3>
          <p className="mt-1 text-sm text-text-muted">Track statuses, cancellations, and history.</p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-accent">View Reservations →</span>
        </Link>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl tracking-widest">Recent Bookings</h2>
          <Link to="/client/reservations" className="text-sm font-semibold text-accent">See all</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`sk-${idx}`} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-bg-card px-4 py-3">
                <div className="h-10 w-12 rounded-lg skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 rounded skeleton" />
                  <div className="h-3 w-28 rounded skeleton" />
                </div>
                <div className="h-6 w-20 rounded-full skeleton" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-text-muted">
            <Car size={32} />
            <p>
              No bookings yet.{' '}
              <Link to="/client/vehicles" className="font-semibold text-accent">Find a car</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map(r => (
              <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-bg-card px-4 py-3">
                <div className="h-10 w-12 overflow-hidden rounded-lg bg-bg-base/50">
                  {r.vehicle?.image_url
                    ? <img src={r.vehicle.image_url} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-text-muted"><Car size={20} /></div>}
                </div>
                <div className="flex-1">
                  <span className="block text-sm font-semibold">{r.vehicle?.brand} {r.vehicle?.model}</span>
                  <span className="text-xs text-text-muted">{r.start_date} → {r.end_date}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge status={r.status} />
                  <span className="text-xs text-text-muted">{r.total_price} DZD</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
