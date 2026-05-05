import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Car } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import VehicleImageGallery from '../../components/ui/VehicleImageGallery'
import VehicleImageViewer from '../../components/ui/VehicleImageViewer'

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
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')
  const [viewer, setViewer] = useState({ isOpen: false, images: [], index: 0 })
  const { addToast } = useToast()

  useEffect(() => { load() }, [])

  useEffect(() => {
    const previews = imageFiles.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
    return () => previews.forEach(url => URL.revokeObjectURL(url))
  }, [imageFiles])

  async function load() {
    const { data } = await supabase
      .from('vehicles')
      .select('*, images:vehicle_images(url)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    setVehicles(data ?? [])
    setLoading(false)
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditTarget(null)
    setImageFiles([])
    setExistingImages([])
    setModal('form')
  }
  function openEdit(v) {
    setForm({
      brand: v.brand, model: v.model, year: String(v.year), color: v.color,
      plate_number: v.plate_number, daily_price: String(v.daily_price),
      fuel_type: v.fuel_type, transmission: v.transmission,
      seats: String(v.seats), image_url: v.image_url ?? '', description: v.description ?? '',
    })
    setEditTarget(v)
    setImageFiles([])
    setExistingImages((v.images ?? []).map(img => img.url))
    setModal('form')
  }
  function closeModal() { setModal(null); setEditTarget(null) }

  function openViewer(v, index = 0) {
    const urls = [v.image_url, ...(v.images?.map(img => img.url) ?? [])].filter(Boolean)
    setViewer({ isOpen: true, images: urls, index })
  }

  async function handleRemoveExistingImage(url) {
    if (!confirm('Remove this image?')) return
    setExistingImages(prev => prev.filter(img => img !== url))
    // Also remove from vehicle_images table
    const { error } = await supabase.from('vehicle_images').delete().eq('url', url)
    if (error) addToast(error.message, 'error')
    else addToast('Image removed.', 'info')
  }

  function handle(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function uploadVehicleImages(vehicleId, files) {
    const urls = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${vehicleId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('vehicles')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('vehicles').getPublicUrl(path)
      const url = data?.publicUrl
      if (url) {
        urls.push(url)
        await supabase.from('vehicle_images').insert({ vehicle_id: vehicleId, url })
      }
    }
    return urls
  }

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
    let vehicleId = editTarget?.id
    if (editTarget) {
      ({ error } = await supabase.from('vehicles').update(payload).eq('id', editTarget.id))
    } else {
      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert(payload)
        .select('id')
        .single()
      error = insertError
      if (!error) vehicleId = data.id
    }

    if (!error && imageFiles.length > 0 && vehicleId) {
      try {
        const urls = await uploadVehicleImages(vehicleId, imageFiles)
        if (urls[0]) {
          await supabase.from('vehicles').update({ image_url: urls[0] }).eq('id', vehicleId)
        }
      } catch (uploadError) {
        error = uploadError
      }
    }

    setSaving(false)
    if (error) { addToast(error.message, 'error'); return }
    addToast(editTarget ? 'Vehicle updated.' : 'Vehicle added.', 'success')
    closeModal()
    load()
  }

  async function deleteVehicle(id) {
    if (!confirm('Delete this vehicle? This cannot be undone.')) return
    setDeleting(id)
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    setDeleting(null)
    if (error) { addToast(error.message, 'error'); return }
    setVehicles(vs => vs.filter(v => v.id !== id))
    addToast('Vehicle deleted.', 'info')
  }

  const filtered = vehicles.filter(v =>
    `${v.brand} ${v.model} ${v.plate_number}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-widest">My Fleet</h1>
          <p className="mt-2 text-sm text-text-muted">Manage your vehicles</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-bg-card px-4 py-2">
            <input
              className="w-48 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              placeholder="Search fleet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openAdd} size="md">
            <Plus size={16} /> Add Vehicle
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`sk-${idx}`} className="rounded-2xl border border-white/10 bg-bg-card p-5">
              <div className="h-32 w-full rounded-xl skeleton" />
              <div className="mt-4 h-4 w-40 rounded skeleton" />
              <div className="mt-2 h-3 w-28 rounded skeleton" />
              <div className="mt-4 h-9 w-32 rounded-xl skeleton" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-text-muted">
          <Car size={36} />
          <p>No vehicles match your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {filtered.map((v, index) => (
            <motion.div
              key={v.id}
              className="group rounded-2xl border border-transparent bg-bg-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px #E8B84B15', borderColor: '#E8B84B44' }}
            >
              <div className="relative h-32 w-full overflow-hidden rounded-xl bg-bg-base/50">
                {(v.image_url || v.images?.[0]?.url)
                  ? <img 
                      src={v.image_url || v.images?.[0]?.url} 
                      alt={`${v.brand} ${v.model}`} 
                      className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-110" 
                      onClick={() => openViewer(v)}
                    />
                  : <div className="flex h-full w-full items-center justify-center text-text-muted"><Car size={36} /></div>}
                <span className={[
                  'absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]',
                  v.is_available ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
                ].join(' ')}>
                  {v.is_available ? 'Available' : 'Rented'}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-semibold">{v.brand} {v.model} ({v.year})</h3>
                <p className="mt-1 text-xs text-text-muted">{v.plate_number} · {v.color}</p>
                <p className="mt-2 text-sm font-semibold text-accent">{v.daily_price} DZD/day</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(v)}>
                    <Pencil size={13} /> Edit
                  </Button>
                  <Button size="sm" variant="danger" loading={deleting === v.id} onClick={() => deleteVehicle(v.id)}>
                    <Trash2 size={13} /> Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modal === 'form'} onClose={closeModal} title={editTarget ? 'Edit Vehicle' : 'Add Vehicle'} size="lg">
        <form onSubmit={saveVehicle} className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Brand" id="brand" name="brand" value={form.brand} onChange={handle} placeholder="" required />
            <Input label="Model" id="model" name="model" value={form.model} onChange={handle} placeholder="" required />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Year" id="year" name="year" type="number" value={form.year} onChange={handle} placeholder="" required />
            <Input label="Color" id="color" name="color" value={form.color} onChange={handle} placeholder="" required />
            <Input label="Plate Number" id="plate_number" name="plate_number" value={form.plate_number} onChange={handle} placeholder="" required />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Daily Price (DZD)" id="daily_price" name="daily_price" type="number" value={form.daily_price} onChange={handle} placeholder="" required />
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
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">Vehicle Gallery</label>
            <VehicleImageGallery 
              files={imageFiles}
              onFilesChange={setImageFiles}
              existingUrls={existingImages}
              onRemoveExisting={handleRemoveExistingImage}
            />
            {existingImages.length > 0 && imageFiles.length === 0 && (
              <p className="text-xs text-text-muted italic">Gallery items are saved. Upload more to add to the collection.</p>
            )}
          </div>
          <Input label="Description (optional)" id="description" name="description" value={form.description} onChange={handle} placeholder="Brief description of the vehicle..." />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saving}>{editTarget ? 'Save Changes' : 'Add Vehicle'}</Button>
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
