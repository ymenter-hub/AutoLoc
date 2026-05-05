import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Users, User } from 'lucide-react'
import { useNotifications } from '../../contexts/NotificationContext'
import { useToast } from '../../contexts/ToastContext'
import { supabase } from '../../lib/supabase'

export default function NotificationForm() {
  const [type, setType] = useState('info')
  const [message, setMessage] = useState('')
  const [receiverId, setReceiverId] = useState('all')
  const [clients, setClients] = useState([])
  const [sending, setSending] = useState(false)
  const { sendNotification } = useNotifications()
  const { addToast } = useToast()

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'client')
      if (!error && data) {
        setClients(data)
      }
    }
    fetchClients()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) return

    setSending(true)
    
    try {
      if (receiverId === 'all') {
        const promises = clients.map(client => 
          sendNotification({ receiverId: client.id, message, type })
        )
        await Promise.all(promises)
        addToast(`Notification sent to ${clients.length} clients`, 'success')
      } else {
        const { error } = await sendNotification({ receiverId, message, type })
        if (error) throw error
        addToast('Notification sent successfully', 'success')
      }
      setMessage('')
    } catch (err) {
      addToast(err.message || 'Failed to send notification', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-bg-card p-6 md:p-8">
      <h2 className="font-heading text-xl tracking-widest uppercase mb-6">New Message</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Type</label>
          <div className="flex gap-2">
            {['info', 'deal', 'alert'].map(t => (
              <label
                key={t}
                className={`flex-1 cursor-pointer rounded-xl border p-3 text-center transition-all ${
                  type === t
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5 text-text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={type === t}
                  onChange={e => setType(e.target.value)}
                  className="hidden"
                />
                <span className="text-xs font-bold uppercase tracking-widest">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Recipient</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              {receiverId === 'all' ? <Users size={16} /> : <User size={16} />}
            </div>
            <select
              value={receiverId}
              onChange={e => setReceiverId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-bg-base py-3 pl-12 pr-4 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Clients ({clients.length})</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-white/10 bg-bg-base p-4 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Type your message here..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent px-6 py-4 text-sm font-bold text-bg-base transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          <span className="relative z-10 flex items-center gap-2">
            {sending ? 'Sending...' : 'Send Notification'}
            {!sending && <Send size={16} className="transition-transform group-hover:translate-x-1" />}
          </span>
          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </form>
    </div>
  )
}
