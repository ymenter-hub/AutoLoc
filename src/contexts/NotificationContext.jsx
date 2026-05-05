import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { session, profile } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id || !profile) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchNotifications() {
      setLoading(true)
      try {
        const query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })

        if (profile.role === 'owner') {
          query.eq('sender_id', session.user.id)
        } else {
          query.eq('receiver_id', session.user.id)
        }

        const { data, error } = await query
        
        if (!error && data && isMounted) {
          setNotifications(data)
          if (profile.role === 'client') {
            setUnreadCount(data.filter(n => !n.is_read).length)
          } else {
            setUnreadCount(0)
          }
        }
      } catch (e) {
        console.error('Error fetching notifications:', e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchNotifications()

    const subscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(subscription)
    }
  }, [session?.user?.id, profile])

  async function markAsRead(id) {
    if (!session?.user?.id || profile?.role !== 'client') return
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  async function markAllAsRead() {
    if (!session?.user?.id || profile?.role !== 'client') return
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('receiver_id', session.user.id)
      .eq('is_read', false)
      
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  async function sendNotification({ receiverId, message, type }) {
    if (profile?.role !== 'owner') return { error: { message: 'Only owners can send notifications' } }
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        sender_id: session.user.id,
        receiver_id: receiverId,
        message,
        type
      })
      .select()
      .single()
      
    return { data, error }
  }

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    sendNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider')
  return ctx
}
