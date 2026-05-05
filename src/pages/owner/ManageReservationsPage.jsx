import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, ExternalLink, ClipboardList } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useNotifications } from '../../contexts/NotificationContext'
import Button from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

export default function ManageReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [filter, setFilter] = useState('all')
  const { addToast } = useToast()
  const { sendNotification } = useNotifications()
  const [licenseLoading, setLicenseLoading] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('reservations')
      .select('*, vehicle:vehicles!inner(brand, model, owner_id, plate_number), client:profiles(full_name, phone, agency_name)')
      .eq('vehicle.owner_id', user.id)
      .order('created_at', { ascending: false })
    setReservations(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    setActionId(id + status)
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
    setActionId(null)
    if (error) { addToast(error.message, 'error'); return }

    // Notify the client
    const res = reservations.find(r => r.id === id)
    if (res) {
      await sendNotification({
        receiverId: res.client_id,
        message: `Your reservation for ${res.vehicle?.brand} ${res.vehicle?.model} has been ${status}.`,
        type: status === 'confirmed' ? 'info' : 'alert'
      })
    }

    // The DB trigger handles auto-rejecting others and marking vehicle unavailable
    // Reload to reflect all the cascade changes
    addToast(
      status === 'confirmed' ? 'Reservation confirmed. Competing requests auto-rejected.' : 'Reservation rejected.',
      status === 'confirmed' ? 'success' : 'info'
    )
    load()
  }

  async function getLicenseUrl(pathOrUrl, reservationId) {
  setLicenseLoading(reservationId)
  try {
    // If it's already a full URL (starts with http), open directly
    if (pathOrUrl.startsWith('http')) {
      window.open(pathOrUrl, '_blank')
      return
    }
    // Otherwise it's a storage path — create a signed URL
    const { data, error } = await supabase.storage
      .from('licenses')
      .createSignedUrl(pathOrUrl, 120)
    if (error || !data?.signedUrl) {
      addToast('Could not load license. It may have been deleted.', 'error')
      return
    }
    window.open(data.signedUrl, '_blank')
  } finally {
    setLicenseLoading(null)
  }
}

  const displayed = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === filter)

  const counts = {
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    rejected: reservations.filter(r => r.status === 'rejected').length,
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-widest">Reservations</h1>
          <p className="mt-2 text-sm text-text-muted">Review and manage client requests</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-bg-card p-1">
          {['all', 'pending', 'confirmed', 'rejected'].map(f => (
            <button
              key={f}
              className={[
                'rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition',
                filter === f ? 'bg-accent text-bg-base' : 'text-text-muted hover:bg-white/5',
              ].join(' ')}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-bg-card p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Pending</p>
          <p className="mt-2 text-2xl font-heading tracking-widest text-accent">{counts.pending}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-bg-card p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Confirmed</p>
          <p className="mt-2 text-2xl font-heading tracking-widest text-success">{counts.confirmed}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-bg-card p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Rejected</p>
          <p className="mt-2 text-2xl font-heading tracking-widest text-danger">{counts.rejected}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`sk-${idx}`} className="rounded-2xl border border-white/10 bg-bg-card p-4">
              <div className="flex flex-wrap justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-40 rounded skeleton" />
                  <div className="h-3 w-28 rounded skeleton" />
                  <div className="h-3 w-56 rounded skeleton" />
                </div>
                <div className="h-6 w-24 rounded-full skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-text-muted">
          <ClipboardList size={36} />
          <p>No {filter !== 'all' ? filter : ''} reservations found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((r, index) => (
            <motion.div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-bg-card p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-semibold">{r.client?.full_name}</span>
                    {r.client?.phone && <span className="ml-2 text-xs text-text-muted">{r.client.phone}</span>}
                  </div>
                  <div className="text-sm text-text-muted">
                    {r.vehicle?.brand} {r.vehicle?.model}
                    <span className="ml-2 rounded bg-bg-base/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                      {r.vehicle?.plate_number}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted">
                    {r.start_date} → {r.end_date} · <strong className="text-text-primary">{r.total_price} DZD</strong>
                  </div>
                  {r.notes && <p className="text-xs text-text-muted italic">"{r.notes}"</p>}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Badge status={r.status} />

                  {r.license_url && (
                    <button
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-text-muted hover:border-white/30 hover:text-text-primary disabled:opacity-50"
                      onClick={() => getLicenseUrl(r.license_url, r.id)}
                      disabled={licenseLoading === r.id}
                    >
                      <ExternalLink size={13} />
                      {licenseLoading === r.id ? 'Opening...' : 'View License'}
                    </button>
                  )}

                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        loading={actionId === r.id + 'confirmed'}
                        onClick={() => updateStatus(r.id, 'confirmed')}
                      >
                        <CheckCircle2 size={14} /> Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={actionId === r.id + 'rejected'}
                        onClick={() => updateStatus(r.id, 'rejected')}
                      >
                        <XCircle size={14} /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
