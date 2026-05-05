import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function VehicleImageViewer({ images, initialIndex = 0, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

  if (!isOpen || !images.length) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          className="absolute right-6 top-6 z-[110] rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Main Image Container */}
        <div 
          className="relative flex h-[70vh] w-full max-w-5xl items-center justify-center px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation Arrows */}
          <button
            className="absolute left-4 z-[110] rounded-full bg-black/50 p-4 text-white transition hover:bg-accent hover:text-bg-base"
            onClick={prev}
          >
            <ChevronLeft size={32} />
          </button>
          
          <button
            className="absolute right-4 z-[110] rounded-full bg-black/50 p-4 text-white transition hover:bg-accent hover:text-bg-base"
            onClick={next}
          >
            <ChevronRight size={32} />
          </button>

          {/* Image Display */}
          <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt="Vehicle view"
                className="h-full w-full object-contain"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Thumbnails */}
        <div 
          className="mt-8 flex gap-3 overflow-x-auto px-6 pb-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((url, idx) => (
            <button
              key={url + idx}
              onClick={() => setCurrentIndex(idx)}
              className={[
                'h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                currentIndex === idx ? 'border-accent scale-105 shadow-[0_0_20px_#E8B84B44]' : 'border-white/10 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
              ].join(' ')}
            >
              <img src={url} alt="Thumbnail" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        {/* Counter */}
        <div className="mt-4 font-heading text-sm tracking-[0.3em] text-text-muted">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
