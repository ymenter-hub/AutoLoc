import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

function TiltCard({ children, onRemove, label }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg'])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className="perspective-1000 relative"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      layout
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative h-40 w-full overflow-hidden rounded-2xl border border-white/10 bg-bg-card transition-all hover:border-accent/40 hover:glow-accent"
      >
        {children}
        
        {/* Label Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
            {label}
          </p>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 z-10 translate-y-[-10px] rounded-full bg-danger/90 p-1.5 text-white opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100"
        >
          <X size={14} />
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function VehicleImageGallery({ files, onFilesChange, existingUrls, onRemoveExisting }) {
  const [isDragging, setIsDragging] = useState(false)
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).slice(2)
    }))
    setPreviews(newPreviews)
    return () => newPreviews.forEach(p => URL.revokeObjectURL(p.url))
  }, [files])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (droppedFiles.length > 0) {
      onFilesChange([...files, ...droppedFiles])
    }
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files ?? [])
    if (selectedFiles.length > 0) {
      onFilesChange([...files, ...selectedFiles])
    }
  }

  const removeFile = (index) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300',
          isDragging 
            ? 'border-accent bg-accent/5 scale-[0.99] border-glow' 
            : 'border-white/10 bg-bg-base/40 hover:border-white/30'
        ].join(' ')}
      >
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={isDragging ? { y: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Upload className={isDragging ? 'text-accent' : 'text-text-muted'} size={28} />
          </motion.div>
          <div className="text-center">
            <p className="font-heading text-lg tracking-widest text-text-primary">Drop your cars here</p>
            <p className="text-xs text-text-muted">or click to browse</p>
          </div>
        </div>
      </label>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {/* Existing Images */}
          {existingUrls.map((url, idx) => (
            <TiltCard key={`ext-${url}`} label={`Gallery Photo ${idx + 1}`} onRemove={() => onRemoveExisting(url)}>
              <img src={url} alt="Vehicle" className="h-full w-full object-cover" />
            </TiltCard>
          ))}

          {/* New Previews */}
          {previews.map((preview, idx) => (
            <TiltCard key={preview.id} label={`New Upload ${idx + 1}`} onRemove={() => removeFile(idx)}>
              <img src={preview.url} alt="Preview" className="h-full w-full object-cover" />
            </TiltCard>
          ))}
        </AnimatePresence>
      </div>

      {(existingUrls.length === 0 && files.length === 0) && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2 py-8 text-text-muted"
        >
          <ImageIcon size={32} strokeWidth={1} />
          <p className="text-sm italic">No images added yet.</p>
        </motion.div>
      )}
    </div>
  )
}
