import { useEffect, useMemo, useState } from 'react'
import { Car, Fuel, Users, Zap, Upload, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useNotifications } from '../../contexts/NotificationContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import VehicleImageViewer from '../../components/ui/VehicleImageViewer'

export default function VehiclesPage() {
  const { user, profile } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [activeImage, setActiveImage] = useState('')
  const [reserving, setReserving] = useState(false)
  const [form, setForm] = useState({ start_date: '', end_date: '', notes: '' })
  const [licenseFile, setLicenseFile] = useState(null)
  const [viewer, setViewer] = useState({ isOpen: false, images: [], index: 0 })
  const { addToast } = useToast()
  const { sendNotification } = useNotifications()
  const [availFilter, setAvailFilter] = useState('all') // 'all' | 'available' | 'unavailable'

  useEffect(() => { loadVehicles() }, [])

  async function loadVehicles() {
    const { data } = await supabase
      .from('vehicles')
      .select('*, images:vehicle_images(url), owner:profiles(full_name, agency_name)')
      .order('created_at', { ascending: false })
    setVehicles(data ?? [])
    setLoading(false)
  }

  function openModal(v) {
    const firstImage = v.image_url || v.images?.[0]?.url || ''
    setSelected(v)
    setActiveImage(firstImage)
    setForm({ start_date: '', end_date: '', notes: '' })
    setLicenseFile(null)
  }
  function closeModal() { setSelected(null) }

  function openViewer(v, index = 0) {
    const urls = Array.from(new Set([v.image_url, ...(v.images?.map(img => img.url) ?? [])])).filter(Boolean)
    setViewer({ isOpen: true, images: urls, index })
  }

  function calcDays() {
    if (!form.start_date || !form.end_date) return 0
    const diff = (new Date(form.end_date) - new Date(form.start_date)) / 86400000
    return Math.max(0, diff)
  }

  function setDuration(days) {
    const start = new Date()
    const end = new Date()
    end.setDate(start.getDate() + days)
    setForm(f => ({
      ...f,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    }))
  }

  async function submitReservation(e) {
    e.preventDefault()
    if (calcDays() <= 0) { addToast('End date must be after start date.', 'error'); return }
    if (!licenseFile) { addToast('Please upload your driver license photo.', 'error'); return }

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
      
      // 3. Notify the owner
      const ownerId = selected.owner_id || selected.owner?.id
      if (ownerId) {
        await sendNotification({
          receiverId: ownerId,
          message: `New reservation request for ${selected.brand} ${selected.model} from ${profile?.full_name || 'a client'}.`,
          type: 'alert'
        })
      }

      addToast('Reservation submitted! Waiting for agency confirmation.', 'success')
      closeModal()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setReserving(false)
    }
  }

  const filtered = vehicles.filter(v => {
  const matchesSearch = `${v.brand} ${v.model} ${v.plate_number}`.toLowerCase().includes(search.toLowerCase())
  const matchesAvail =
    availFilter === 'all' ? true :
    availFilter === 'available' ? v.is_available :
    !v.is_available
  return matchesSearch && matchesAvail
})

  const days = calcDays()
  const durationOptions = [1, 3, 7, 14]

  const gridVariants = {
    show: { transition: { staggerChildren: 0.08 } },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  }

  const skeletonCards = useMemo(() => Array.from({ length: 6 }), [])

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-widest">Browse Fleet</h1>
          <p className="mt-2 text-sm text-text-muted">Choose from our available vehicles</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-bg-card px-4 py-2">
          <Search size={16} className="text-text-muted" />
          <input
            className="w-52 bg-transparent text-sm text-text-primary outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Availability filter */}
          <div className="mb-6 flex items-center gap-2">
            {[
              { key: 'all',         label: 'All' },
              { key: 'available',   label: 'Available' },
              { key: 'unavailable', label: 'Unavailable' },
            ].map(opt => (
              <button
                key={opt.key}
                type="button"
                className={[
                  'rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition',
                  availFilter === opt.key
                    ? 'border-accent bg-accent text-bg-base'
                    : 'border-white/10 text-text-muted hover:border-white/30',
                ].join(' ')}
                onClick={() => setAvailFilter(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {skeletonCards.map((_, idx) => (
            <div key={`skeleton-${idx}`} className="rounded-2xl border border-white/10 bg-bg-card p-5">
              <div className="h-32 w-full rounded-xl skeleton" />
              <div className="mt-4 h-4 w-40 rounded skeleton" />
              <div className="mt-2 h-3 w-32 rounded skeleton" />
              <div className="mt-5 flex items-center justify-between">
                <div className="h-4 w-20 rounded skeleton" />
                <div className="h-9 w-24 rounded-xl skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-text-muted">
          <Car size={36} />
          <p>No vehicles found.</p>
        </div>
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={gridVariants}
        >
          {filtered.map((v, index) => (
            <motion.div
              key={v.id}
              className={[
                'group rounded-2xl border border-transparent bg-bg-card p-5 transition',
                !v.is_available ? 'opacity-60' : '',
              ].join(' ')}
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: '0 20px 40px #E8B84B15', borderColor: '#E8B84B44' }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="relative h-36 w-full overflow-hidden rounded-xl bg-bg-base/60">
                {v.image_url || v.images?.[0]?.url ? (
                  <img 
                    src={v.image_url || v.images?.[0]?.url} 
                    alt={`${v.brand} ${v.model}`} 
                    className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-110" 
                    onClick={(e) => {
                      e.stopPropagation();
                      openViewer(v);
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-text-muted">
                    <Car size={40} />
                  </div>
                )}
                <motion.span
                  className={[
                    'absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]',
                    v.is_available ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
                  ].join(' ')}
                  animate={v.is_available ? { scale: [1, 1.15, 1] } : undefined}
                  transition={v.is_available ? { repeat: Infinity, duration: 2 } : undefined}
                >
                  {v.is_available ? 'Available' : 'Unavailable'}
                </motion.span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">
                  <p className="font-semibold">{v.brand} {v.model}</p>
                  {(v.owner?.agency_name || v.owner?.full_name) && (
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-accent/70">
                      {v.owner.agency_name || v.owner.full_name}
                    </p>
                  )}
                  <span className="text-sm text-text-muted">'{String(v.year).slice(2)}</span>
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1"><Fuel size={13} /> {v.fuel_type}</span>
                  <span className="inline-flex items-center gap-1"><Users size={13} /> {v.seats} seats</span>
                  <span className="inline-flex items-center gap-1"><Zap size={13} /> {v.transmission}</span>
                </div>
                {v.description && <p className="mt-3 text-sm text-text-muted">{v.description}</p>}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-text-muted"><strong className="text-text-primary">{v.daily_price} DZD</strong>/day</span>
                  <motion.button
                    className={[
                      'rounded-xl px-4 py-2 text-xs font-semibold',
                      v.is_available ? 'bg-accent text-bg-base' : 'bg-white/5 text-text-muted',
                    ].join(' ')}
                    disabled={!v.is_available}
                    onClick={() => openModal(v)}
                    whileHover={v.is_available ? { scale: 1.03 } : undefined}
                    whileTap={v.is_available ? { scale: 0.97 } : undefined}
                  >
                    {v.is_available ? 'Reserve' : 'Unavailable'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Reservation Modal */}
      <Modal isOpen={!!selected} onClose={closeModal} title={`Reserve: ${selected?.brand} ${selected?.model}`}>
        <form onSubmit={submitReservation} className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-bg-base/40 p-4">
            <div className="relative h-40 w-full overflow-hidden rounded-xl bg-bg-base/60">
              {activeImage ? (
                <img src={activeImage} alt="Vehicle" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text-muted">
                  <Car size={32} />
                </div>
              )}
            </div>
            {(selected?.images?.length || selected?.image_url) && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {Array.from(new Set([selected?.image_url, ...(selected?.images?.map(img => img.url) ?? [])]))
                  .filter(Boolean)
                  .map((url, idx) => (
                    <button
                      key={`${url}-${idx}`}
                      type="button"
                      className={[
                        'h-14 w-20 overflow-hidden rounded-lg border transition',
                        activeImage === url ? 'border-accent' : 'border-white/10',
                      ].join(' ')}
                      onClick={() => setActiveImage(url)}
                    >
                      <img src={url} alt="Vehicle thumbnail" className="h-full w-full object-cover" />
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-bg-base/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Selected vehicle</p>
                <p className="text-lg font-semibold">{selected?.brand} {selected?.model}</p>
                {selected?.owner?.agency_name && (
                  <p className="mt-0.5 text-xs uppercase tracking-[0.2em] text-accent">
                    {selected.owner.agency_name}
                  </p>
                )}
                {selected?.owner?.full_name && (
                  <p className="mt-0.5 text-xs text-text-muted">
                    Owner: {selected.owner.full_name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Daily price</p>
                <p className="mt-1 text-lg font-semibold text-accent">{selected?.daily_price} DZD</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-bg-card/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Quick durations</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {durationOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDuration(option)}
                  className={[
                    'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition',
                    days === option ? 'bg-accent text-bg-base' : 'border border-white/10 text-text-muted hover:border-white/30',
                  ].join(' ')}
                >
                  {option} day{option > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
            <div className="flex items-center justify-between rounded-xl border border-accent/40 bg-accent-dim px-4 py-3 text-sm text-text-muted">
              <span>{days} day{days > 1 ? 's' : ''} × {selected?.daily_price} DZD</span>
              <strong className="text-accent">{days * (selected?.daily_price ?? 0)} DZD</strong>
            </div>
          )}

          {/* License upload */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              <Upload size={14} />
              Driver License Photo <span className="text-danger">*required</span>
            </label>
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/20 bg-bg-base/40 px-4 py-6 text-sm text-text-muted transition hover:border-accent">
              <input
                type="file"
                accept="image/*"
                onChange={e => setLicenseFile(e.target.files[0])}
                className="hidden"
              />
              {licenseFile
                ? <span className="font-semibold text-success">✓ {licenseFile.name}</span>
                : <span>Click to upload (JPG, PNG)</span>}
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Notes (optional)</label>
            <textarea
              className="mt-2 w-full rounded-xl border border-white/10 bg-bg-card/60 px-3 py-3 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
              rows={3}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={reserving}>Confirm Request</Button>
          </div>
        </form>
      </Modal>

      <VehicleImageViewer
        isOpen={viewer.isOpen}
        images={viewer.images}
        initialIndex={viewer.index}
        onClose={() => setViewer(v => ({ ...v, isOpen: false }))}
      />
    </div>
  )
}