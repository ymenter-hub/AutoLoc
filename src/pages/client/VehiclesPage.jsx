import { useEffect, useState } from 'react'
import { Car, Fuel, Users, Zap, Calendar, Upload, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import styles from './Client.module.css'

export default function VehiclesPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [reserving, setReserving] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ start_date: '', end_date: '', notes: '' })
  const [licenseFile, setLicenseFile] = useState(null)

  useEffect(() => { loadVehicles() }, [])

  async function loadVehicles() {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
    setVehicles(data ?? [])
    setLoading(false)
  }

  function showToast(msg, type = 'info') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function openModal(v) { setSelected(v); setForm({ start_date: '', end_date: '', notes: '' }); setLicenseFile(null) }
  function closeModal() { setSelected(null) }

  function calcDays() {
    if (!form.start_date || !form.end_date) return 0
    const diff = (new Date(form.end_date) - new Date(form.start_date)) / 86400000
    return Math.max(0, diff)
  }

  async function submitReservation(e) {
    e.preventDefault()
    if (calcDays() <= 0) { showToast('End date must be after start date.', 'error'); return }
    if (!licenseFile) { showToast('Please upload your driver license photo.', 'error'); return }

    setReserving(true)
    try {
      // 1. Upload license to Storage
      const ext = licenseFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('licenses')
        .upload(path, licenseFile, { upsert: true })
      if (uploadErr) throw uploadErr

      // 2. Create reservation
      const totalPrice = calcDays() * selected.daily_price
      const { error: resErr } = await supabase.from('reservations').insert({
        client_id: user.id,
        vehicle_id: selected.id,
        start_date: form.start_date,
        end_date: form.end_date,
        total_price: totalPrice,
        license_url: path,
        notes: form.notes || null,
        status: 'pending',
      })
      if (resErr) throw resErr

      showToast('Reservation submitted! Waiting for agency confirmation.', 'success')
      closeModal()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setReserving(false)
    }
  }

  const filtered = vehicles.filter(v =>
    `${v.brand} ${v.model} ${v.plate_number}`.toLowerCase().includes(search.toLowerCase())
  )

  const days = calcDays()

  return (
    <div className="fade-up">
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Browse Fleet</h1>
          <p className={styles.sub}>Choose from our available vehicles</p>
        </div>
        <div className={styles.searchBox}>
          <Search size={16} color="var(--text-muted)" />
          <input
            className={styles.searchInput}
            placeholder="Search by brand, model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Car size={36} color="var(--text-muted)" />
          <p>No vehicles found.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(v => (
            <div key={v.id} className={`${styles.vehicleCard} ${!v.is_available ? styles.unavailable : ''}`}>
              <div className={styles.vehicleImg}>
                {v.image_url
                  ? <img src={v.image_url} alt={`${v.brand} ${v.model}`} />
                  : <Car size={40} color="var(--text-muted)" />}
                <div className={`${styles.availBadge} ${v.is_available ? styles.available : styles.taken}`}>
                  {v.is_available ? 'Available' : 'Unavailable'}
                </div>
              </div>
              <div className={styles.vehicleBody}>
                <h3 className={styles.vehicleName}>{v.brand} {v.model} <span className={styles.year}>'{String(v.year).slice(2)}</span></h3>
                <div className={styles.vehicleMeta}>
                  <span><Fuel size={13} /> {v.fuel_type}</span>
                  <span><Users size={13} /> {v.seats} seats</span>
                  <span><Zap size={13} /> {v.transmission}</span>
                </div>
                {v.description && <p className={styles.vehicleDesc}>{v.description}</p>}
                <div className={styles.vehicleFooter}>
                  <span className={styles.price}><strong>{v.daily_price} DZD</strong>/day</span>
                  <Button
                    size="sm"
                    disabled={!v.is_available}
                    onClick={() => openModal(v)}
                  >
                    {v.is_available ? 'Reserve' : 'Unavailable'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservation Modal */}
      <Modal isOpen={!!selected} onClose={closeModal} title={`Reserve: ${selected?.brand} ${selected?.model}`}>
        <form onSubmit={submitReservation} className={styles.resForm}>
          <div className={styles.row2}>
            <Input
              label="Start Date"
              id="start_date"
              type="date"
              value={form.start_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              required
            />
            <Input
              label="End Date"
              id="end_date"
              type="date"
              value={form.end_date}
              min={form.start_date || new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              required
            />
          </div>

          {days > 0 && (
            <div className={styles.pricePreview}>
              <span>{days} day{days > 1 ? 's' : ''} × {selected?.daily_price} DZD</span>
              <strong>{days * (selected?.daily_price ?? 0)} DZD</strong>
            </div>
          )}

          {/* License upload */}
          <div className={styles.uploadField}>
            <label className={styles.uploadLabel}>
              <Upload size={14} />
              Driver License Photo <span className={styles.req}>*required</span>
            </label>
            <label className={styles.uploadZone}>
              <input
                type="file"
                accept="image/*"
                onChange={e => setLicenseFile(e.target.files[0])}
                className={styles.fileInput}
              />
              {licenseFile
                ? <span className={styles.fileName}>✓ {licenseFile.name}</span>
                : <span>Click to upload (JPG, PNG)</span>}
            </label>
          </div>

          <Input
            label="Notes (optional)"
            id="notes"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Any special request..."
          />

          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={reserving}>Confirm Request</Button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  )
}
