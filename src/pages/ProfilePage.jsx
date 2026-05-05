import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import AvatarCropper from '../components/ui/AvatarCropper'

export default function ProfilePage() {
  const { profile, updateAvatar, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cropFile, setCropFile] = useState(null)
  const [cropOpen, setCropOpen] = useState(false)
  const { addToast } = useToast()

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await updateProfile({ fullName, phone })
    setSaving(false)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCropFile(file)
    setCropOpen(true)
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-widest">Profile Settings</h1>
          <p className="mt-2 text-sm text-text-muted">Update your personal info and avatar.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[0.6fr_1fr]">
        <motion.div
          className="rounded-2xl border border-white/10 bg-bg-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-32 w-32 overflow-hidden rounded-full border border-white/10 bg-bg-base/60">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-accent">
                  {profile?.full_name?.slice(0, 2)?.toUpperCase() ?? 'AL'}
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {uploading ? 'Uploading...' : 'Upload Avatar'}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
            <div>
              <p className="text-sm font-semibold text-text-primary">{profile?.full_name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{profile?.role}</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSave}
          className="rounded-2xl border border-white/10 bg-bg-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid gap-4">
            <Input
              label="Full Name"
              id="profile_full_name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
            <Input
              label="Phone"
              id="profile_phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+213 000 000 000"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </motion.form>
      </div>
      <AvatarCropper
        file={cropFile}
        isOpen={cropOpen}
        onClose={() => {
          setCropOpen(false)
          setCropFile(null)
        }}
        onSave={async (blob, filename) => {
          setUploading(true)
          const { error } = await updateAvatar(blob, filename)
          if (error) addToast(error.message || 'Avatar upload failed.', 'error')
          else addToast('Avatar updated.', 'success')
          setUploading(false)
          return { error }
        }}
      />
    </div>
  )
}
