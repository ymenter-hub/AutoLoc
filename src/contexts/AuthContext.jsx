import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [profileReady, setProfileReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setSession(null)
        setProfileReady(true) // no session = nothing to fetch, ready immediately
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setProfileReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    setProfileReady(false)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (!error && data) {
        let avatarUrl = data.avatar_url
        if (data.avatar_path) {
          const { data: signed } = await supabase.storage
            .from('avatars')
            .createSignedUrl(data.avatar_path, 60 * 60)
          avatarUrl = signed?.signedUrl ?? avatarUrl
        }
        setProfile({ ...data, avatar_url: avatarUrl })
      } else {
        // Profile fetch failed (RLS issue, table missing, etc.)
        // Still mark as ready so the app doesn't hang
        console.warn('Profile fetch failed:', error?.message)
      }
    } catch (e) {
      console.warn('Profile fetch exception:', e)
    } finally {
      setProfileReady(true)
    }
  }

  async function signUp({ email, password, fullName, role }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })
    return { data, error }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function updateProfile({ fullName, phone }) {
    if (!session?.user?.id) return { error: { message: 'No session.' } }
    const updates = {
      full_name: fullName ?? profile?.full_name ?? null,
      phone: phone ?? profile?.phone ?? null,
    }
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
    if (!error) setProfile(p => (p ? { ...p, ...updates } : p))
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

const updateAvatar = async (file, filename) => {
    if (!session?.user?.id || !file) return { error: { message: 'No file provided.' } }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size && file.size > maxSize) {
      const err = { message: 'File too large. Max 5MB allowed.' }
      console.error('Avatar upload error:', err)
      return { error: err }
    }

    const originalName = filename || file.name || 'avatar.jpg'
    const ext = originalName.split('.').pop()
    const path = `${session.user.id}/${Date.now()}.${ext}`
    const uploadFile = file instanceof File
      ? file
      : new File([file], originalName, { type: file.type || 'image/jpeg' })
    let uploadError = null
    try {
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, uploadFile, { upsert: true, contentType: uploadFile.type })
      uploadError = error
    } catch (e) {
      console.error('Unexpected error during avatar upload:', e)
      return { error: e }
    }
    if (uploadError) {
      console.error('Avatar upload error (status', uploadError.status, '):', uploadError)
      return { error: uploadError }
    }

    const { data: signed } = await supabase.storage
      .from('avatars')
      .createSignedUrl(path, 60 * 60)
    const avatarUrl = signed?.signedUrl ?? null

    let profileError = null
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl, avatar_path: path })
        .eq('id', session.user.id)
      profileError = error
    } catch (e) {
      console.error('Unexpected error updating profile after avatar upload:', e)
      return { error: e }
    }
    if (!profileError) {
      setProfile(p => (p ? { ...p, avatar_url: avatarUrl, avatar_path: path } : p))
    } else {
      console.error('Profile update error after avatar upload (status', profileError?.status, '):', profileError)
    }
    return { error: profileError }
  }

  // Only show spinner while we haven't determined auth state yet
  const loading = session === undefined || !profileReady

  const value = {
    session,
    profile,
    user: session?.user ?? null,
    loading,
    isClient: profile?.role === 'client',
    isOwner: profile?.role === 'owner',
    signUp,
    signIn,
    signOut,
    updateAvatar,
    updateProfile,
    refreshProfile: () => session && fetchProfile(session.user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
