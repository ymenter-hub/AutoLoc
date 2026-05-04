import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, ExternalLink, ClipboardList } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import styles from './Owner.module.css'

export default function ManageReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('reservations')
      .select('*, vehicle:vehicles!inner(brand, model, owner_id, plate_number), client:profiles(full_name, phone)')
      .eq('vehicle.owner_id', user.id)
      .order('created_at', { ascending: false })
    setReservations(data ?? [])
    setLoading(false)
  }

  function showToast(msg, type = 'info') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  async function updateStatus(id, status) {
    setActionId(id + status)
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
    setActionId(null)
    if (error) { showToast(error.message, 'error'); return }

    // The DB trigger handles auto-rejecting others and marking vehicle unavailable
    // Reload to reflect all the cascade changes
    showToast(
      status === 'confirmed' ? 'Reservation confirmed. Competing requests auto-rejected.' : 'Reservation rejected.',
      status === 'confirmed' ? 'success' : 'info'
    )
    load()
  }

  async function getLicenseUrl(path) {
    const { data } = await supabase.storage.from('licenses').createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const displayed = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === filter)

  return (
    <div className="fade-up">
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Reservations</h1>
          <p className={styles.sub}>Review and manage client requests</p>
        </div>
        {/* Filter tabs */}
        <div className={styles.filterTabs}>
          {['all', 'pending', 'confirmed', 'rejected'].map(f => (
            <button
              key={f}
              className={`${styles.filterTab} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className={styles.empty}>
          <ClipboardList size={36} color="var(--text-muted)" />
          <p>No {filter !== 'all' ? filter : ''} reservations found.</p>
        </div>
      ) : (
        <div className={styles.resList}>
          {displayed.map(r => (
            <div key={r.id} className={styles.resCard}>
              <div className={styles.resMain}>
                <div className={styles.resLeft}>
                  <div className={styles.resClient}>
                    <span className={styles.clientName}>{r.client?.full_name}</span>
                    {r.client?.phone && <span className={styles.clientPhone}>{r.client.phone}</span>}
                  </div>
                  <div className={styles.resVehicle}>
                    {r.vehicle?.brand} {r.vehicle?.model}
                    <span className={styles.plate}>{r.vehicle?.plate_number}</span>
                  </div>
                  <div className={styles.resDates}>
                    {r.start_date} → {r.end_date} · <strong style={{ color: 'var(--text)' }}>{r.total_price} DZD</strong>
                  </div>
                  {r.notes && <p className={styles.resNotes}>"{r.notes}"</p>}
                </div>

                <div className={styles.resRight}>
                  <Badge status={r.status} />

                  {r.license_url && (
                    <button className={styles.licenseBtn} onClick={() => getLicenseUrl(r.license_url)}>
                      <ExternalLink size={13} /> View License
                    </button>
                  )}

                  {r.status === 'pending' && (
                    <div className={styles.actions}>
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
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  )
}
