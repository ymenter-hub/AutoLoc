import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Car } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import styles from './Owner.module.css'

const EMPTY_FORM = {
  brand: '', model: '', year: '', color: '', plate_number: '',
  daily_price: '', fuel_type: 'petrol', transmission: 'manual',
  seats: '5', image_url: '', description: '',
}

export default function ManageVehiclesPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    setVehicles(data ?? [])
    setLoading(false)
  }

  function showToast(msg, type = 'info') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  function openAdd() { setForm(EMPTY_FORM); setEditTarget(null); setModal('form') }
  function openEdit(v) {
    setForm({
      brand: v.brand, model: v.model, year: String(v.year), color: v.color,
      plate_number: v.plate_number, daily_price: String(v.daily_price),
      fuel_type: v.fuel_type, transmission: v.transmission,
      seats: String(v.seats), image_url: v.image_url ?? '', description: v.description ?? '',
    })
    setEditTarget(v)
    setModal('form')
  }
  function closeModal() { setModal(null); setEditTarget(null) }

  function handle(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function saveVehicle(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      brand: form.brand, model: form.model, year: parseInt(form.year),
      color: form.color, plate_number: form.plate_number,
      daily_price: parseFloat(form.daily_price),
      fuel_type: form.fuel_type, transmission: form.transmission,
      seats: parseInt(form.seats),
      image_url: form.image_url || null,
      description: form.description || null,
      owner_id: user.id,
    }

    let error
    if (editTarget) {
      ({ error } = await supabase.from('vehicles').update(payload).eq('id', editTarget.id))
    } else {
      ({ error } = await supabase.from('vehicles').insert(payload))
    }

    setSaving(false)
    if (error) { showToast(error.message, 'error'); return }
    showToast(editTarget ? 'Vehicle updated.' : 'Vehicle added.', 'success')
    closeModal()
    load()
  }

  async function deleteVehicle(id) {
    if (!confirm('Delete this vehicle? This cannot be undone.')) return
    setDeleting(id)
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    setDeleting(null)
    if (error) { showToast(error.message, 'error'); return }
    setVehicles(vs => vs.filter(v => v.id !== id))
    showToast('Vehicle deleted.', 'info')
  }

  return (
    <div className="fade-up">
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>My Fleet</h1>
          <p className={styles.sub}>Manage your vehicles</p>
        </div>
        <Button onClick={openAdd} size="md">
          <Plus size={16} /> Add Vehicle
        </Button>
      </div>

      {loading ? (
        <div className={styles.empty}><div className="spinner" /></div>
      ) : vehicles.length === 0 ? (
        <div className={styles.empty}>
          <Car size={36} color="var(--text-muted)" />
          <p>No vehicles yet. Add your first one.</p>
        </div>
      ) : (
        <div className={styles.fleetGrid}>
          {vehicles.map(v => (
            <div key={v.id} className={styles.fleetCard}>
              <div className={styles.fleetImg}>
                {v.image_url
                  ? <img src={v.image_url} alt={`${v.brand} ${v.model}`} />
                  : <Car size={36} color="var(--text-muted)" />}
                <div className={`${styles.availPill} ${v.is_available ? styles.avail : styles.unavail}`}>
                  {v.is_available ? 'Available' : 'Rented'}
                </div>
              </div>
              <div className={styles.fleetBody}>
                <h3 className={styles.fleetName}>{v.brand} {v.model} ({v.year})</h3>
                <p className={styles.fleetPlate}>{v.plate_number} · {v.color}</p>
                <p className={styles.fleetPrice}>{v.daily_price} DZD/day</p>
                <div className={styles.fleetActions}>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(v)}>
                    <Pencil size={13} /> Edit
                  </Button>
                  <Button size="sm" variant="danger" loading={deleting === v.id} onClick={() => deleteVehicle(v.id)}>
                    <Trash2 size={13} /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modal === 'form'} onClose={closeModal} title={editTarget ? 'Edit Vehicle' : 'Add Vehicle'} size="lg">
        <form onSubmit={saveVehicle} className={styles.vehicleForm}>
          <div className={styles.row2}>
            <Input label="Brand" id="brand" name="brand" value={form.brand} onChange={handle} placeholder="Toyota" required />
            <Input label="Model" id="model" name="model" value={form.model} onChange={handle} placeholder="Corolla" required />
          </div>
          <div className={styles.row3}>
            <Input label="Year" id="year" name="year" type="number" value={form.year} onChange={handle} placeholder="2022" required />
            <Input label="Color" id="color" name="color" value={form.color} onChange={handle} placeholder="White" required />
            <Input label="Plate Number" id="plate_number" name="plate_number" value={form.plate_number} onChange={handle} placeholder="19-DZA-123" required />
          </div>
          <div className={styles.row3}>
            <Input label="Daily Price (DZD)" id="daily_price" name="daily_price" type="number" value={form.daily_price} onChange={handle} placeholder="3500" required />
            <Select
              label="Fuel Type"
              id="fuel_type"
              name="fuel_type"
              value={form.fuel_type}
              onChange={handle}
              options={[
                { value: 'petrol', label: 'Petrol' },
                { value: 'diesel', label: 'Diesel' },
                { value: 'electric', label: 'Electric' },
                { value: 'hybrid', label: 'Hybrid' },
              ]}
            />
            <Select
              label="Transmission"
              id="transmission"
              name="transmission"
              value={form.transmission}
              onChange={handle}
              options={[
                { value: 'manual', label: 'Manual' },
                { value: 'automatic', label: 'Automatic' },
              ]}
            />
          </div>
          <div className={styles.row2}>
            <Input label="Seats" id="seats" name="seats" type="number" value={form.seats} onChange={handle} placeholder="5" />
            <Input label="Image URL (optional)" id="image_url" name="image_url" value={form.image_url} onChange={handle} placeholder="https://..." />
          </div>
          <Input label="Description (optional)" id="description" name="description" value={form.description} onChange={handle} placeholder="Brief description of the vehicle..." />
          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saving}>{editTarget ? 'Save Changes' : 'Add Vehicle'}</Button>
          </div>
        </form>
      </Modal>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  )
}
