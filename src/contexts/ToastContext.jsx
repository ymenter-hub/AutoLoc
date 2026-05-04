import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(items => items.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts(items => [...items, { id, message, type }])
    setTimeout(() => removeToast(id), 3500)
  }, [removeToast])

  const value = useMemo(() => ({ addToast }), [addToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[90vw] flex-col gap-3">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 120 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className={[
              'relative overflow-hidden rounded-xl border px-4 py-3 text-sm font-medium shadow-lg',
              'bg-bg-card text-text-primary',
              t.type === 'success' ? 'border-success text-success' : '',
              t.type === 'error' ? 'border-danger text-danger' : '',
              t.type === 'info' ? 'border-accent text-accent' : '',
            ].join(' ')}
            onClick={() => onRemove(t.id)}
            role="status"
          >
            <span className="block pr-6">{t.message}</span>
            <motion.div
              className={[
                'absolute bottom-0 left-0 h-1 w-full origin-left',
                t.type === 'success' ? 'bg-success/70' : '',
                t.type === 'error' ? 'bg-danger/70' : '',
                t.type === 'info' ? 'bg-accent/70' : '',
              ].join(' ')}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 3.5, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
