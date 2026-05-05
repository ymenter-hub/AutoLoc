import { useCallback, useEffect, useState } from 'react'
import Cropper from 'react-easy-crop'
import Modal from './Modal'
import Button from './Button'

async function getCroppedBlob(imageSrc, cropPixels) {
  const image = new Image()
  image.src = imageSrc
  await new Promise(resolve => {
    image.onload = resolve
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  canvas.width = cropPixels.width
  canvas.height = cropPixels.height

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  )

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9)
  })
}

export default function AvatarCropper({ file, isOpen, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.2)
  const [croppedPixels, setCroppedPixels] = useState(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)

  // ✅ All hooks must be called before any early returns (Rules of Hooks)
  useEffect(() => {
    if (!file || !isOpen) return undefined
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file, isOpen])

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedPixels(croppedAreaPixels)
  }, [])

  // Early returns AFTER all hooks
  if (!file || !isOpen) return null
  if (!preview) return null

  const imageUrl = preview
  const filename = file.name

  async function handleSave(e) {
    if (!croppedPixels) return
    setSaving(true)
    const blob = await getCroppedBlob(imageUrl, croppedPixels)
    if (!blob) {
      setSaving(false)
      return
    }
    // Convert Blob to File to retain original filename and type
    const fileName = filename || 'avatar.jpg'
    const fileType = blob.type || 'image/jpeg'
    const fileObject = new File([blob], fileName, { type: fileType })
    const { error } = await onSave(fileObject, fileName)
    if (error) {
      console.error('Avatar save error:', error)
    }
    setSaving(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop avatar">
      <div className="space-y-4">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-white/10 bg-bg-base/50">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-text-muted">Zoom</span>
          <input
            type="range"
            min="1"
            max="2.5"
            step="0.05"
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="w-full accent-[#E8B84B]"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" loading={saving} onClick={handleSave}>Save avatar</Button>
        </div>
      </div>
    </Modal>
  )
}
