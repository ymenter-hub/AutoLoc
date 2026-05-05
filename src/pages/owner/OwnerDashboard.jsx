import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Car, ClipboardList, Clock, CheckCircle2 } from 'lucide-react'
import { animate, motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Badge } from '../../components/ui/Badge'

export default function OwnerDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ vehicles: 0, pending: 0, confirmed: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    async function load() {
      // Count vehicles
      const { count: vCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)

      // Get reservations on owner's vehicles
      const { data: resData } = await supabase
        .from('reservations')
        .select('*, vehicle:vehicles!inner(brand, model, owner_id), client:profiles(full_name)')
        .eq('vehicle.owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6)

      const pending   = (resData ?? []).filter(r => r.status === 'pending').length
      const confirmed = (resData ?? []).filter(r => r.status === 'confirmed').length

      setStats({ vehicles: vCount ?? 0, pending, confirmed })
      setRecent(resData ?? [])
      setLoading(false)
    }
    load()
  }, [user.id])

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-widest">Agency Dashboard</h1>
          <p className="mt-2 text-sm text-text-muted">Welcome back, {profile?.full_name}</p>
        </div>
        <Link to="/owner/vehicles" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-bg-base">+ Add Vehicle</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Car} value={stats.vehicles} label="Vehicles" color="text-accent" />
        <StatCard icon={Clock} value={stats.pending} label="Pending" color="text-accent" />
        <StatCard icon={CheckCircle2} value={stats.confirmed} label="Confirmed" color="text-success" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          to="/owner/vehicles"
          className="group rounded-2xl border border-white/10 bg-bg-card p-5 transition hover:border-accent/40"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Quick action</p>
          <h3 className="mt-2 text-lg font-semibold">Add a new vehicle</h3>
          <p className="mt-1 text-sm text-text-muted">Grow your fleet with premium listings.</p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-accent">Manage Fleet →</span>
        </Link>
        <Link
          to="/owner/reservations"
          className="group rounded-2xl border border-white/10 bg-bg-card p-5 transition hover:border-accent/40"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Quick action</p>
          <h3 className="mt-2 text-lg font-semibold">Review new requests</h3>
          <p className="mt-1 text-sm text-text-muted">Confirm or reject pending reservations.</p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-accent">Manage Reservations →</span>
        </Link>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl tracking-widest">Latest Requests</h2>
          <Link to="/owner/reservations" className="text-sm font-semibold text-accent">Manage all →</Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-bg-card p-4">
            <div className="grid grid-cols-5 gap-4 text-xs uppercase tracking-[0.3em] text-text-muted">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={`head-${idx}`} className="h-3 rounded skeleton" />
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`row-${idx}`} className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((__, cell) => (
                    <div key={`cell-${idx}-${cell}`} className="h-3 rounded skeleton" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-text-muted">
            <ClipboardList size={32} />
            <p>No reservations yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-card">
            <div className="grid grid-cols-5 gap-4 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.3em] text-text-muted">
              <span>Client</span>
              <span>Vehicle</span>
              <span>Dates</span>
              <span>Price</span>
              <span>Status</span>
            </div>
            {recent.map(r => (
              <div key={r.id} className="grid grid-cols-5 gap-4 border-b border-white/5 px-5 py-4 text-sm">
                <span className="font-semibold">{r.client?.full_name}</span>
                <span>{r.vehicle?.brand} {r.vehicle?.model}</span>
                <span className="text-text-muted">{r.start_date} → {r.end_date}</span>
                <span>{r.total_price} DZD</span>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
