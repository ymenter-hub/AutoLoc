import { useEffect, useState } from 'react'
import { CalendarDays, Car } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Badge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useToast } from '../../contexts/ToastContext'

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [filter, setFilter] = useState('all')
  const { addToast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('reservations')
      .select('*, vehicle:vehicles(brand, model, color, image_url, daily_price)')
      .order('created_at', { ascending: false })
    setReservations(data ?? [])
    setLoading(false)
  }

  async function cancelReservation(id) {
  setCancelling(id)
  // First verify it's still pending (RLS won't let us filter by status in update)
  const { data: current } = await supabase
    .from('reservations')
    .select('status')
    .eq('id', id)
    .single()

  if (current?.status !== 'pending') {
    addToast('This reservation can no longer be cancelled.', 'error')
    setCancelling(null)
    return
  }

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (!error) {
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
    addToast('Reservation cancelled.', 'info')
  } else {
    addToast(error.message, 'error')
  }
  setCancelling(null)
}

  const displayed = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === filter)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl tracking-widest">My Bookings</h1>
        <p className="mt-2 text-sm text-text-muted">All your reservation history</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-bg-card/60 p-2">
        {['all', 'pending', 'confirmed', 'rejected', 'cancelled'].map(status => (
          <button
            key={status}
            type="button"
            className={[
              'rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition',
              filter === status ? 'bg-accent text-bg-base' : 'text-text-muted hover:bg-white/5',
            ].join(' ')}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`sk-${idx}`} className="flex gap-4 rounded-2xl border border-white/10 bg-bg-card p-4">
              <div className="h-16 w-20 rounded-xl skeleton" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-40 rounded skeleton" />
                <div className="h-3 w-32 rounded skeleton" />
                <div className="h-3 w-24 rounded skeleton" />
              </div>
              <div className="h-6 w-20 rounded-full skeleton" />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-text-muted">
          <CalendarDays size={36} />
          <p>No {filter === 'all' ? '' : filter} reservations found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(r => (
            <div key={r.id} className="flex flex-wrap gap-4 rounded-2xl border border-white/10 bg-bg-card p-4">
              <div className="h-16 w-20 overflow-hidden rounded-xl bg-bg-base/50">
                {r.vehicle?.image_url
                  ? <img src={r.vehicle.image_url} alt="" className="h-full w-full object-cover" />
                  : <div className="flex h-full w-full items-center justify-center text-text-muted"><Car size={24} /></div>}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">{r.vehicle?.brand} {r.vehicle?.model}</h3>
                  <Badge status={r.status} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                  <CalendarDays size={13} />
                  {r.start_date} → {r.end_date}
                </div>
                {r.notes && <p className="mt-2 text-xs text-text-muted italic">{r.notes}</p>}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-muted">{r.total_price} DZD total</span>
                  {r.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={cancelling === r.id}
                      onClick={() => cancelReservation(r.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
