import { useState, useEffect } from 'react'
import { X, Upload, Loader2, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ProfileModal({ session, onClose, onSignOut }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    let ignore = false
    async function getProfile() {
      setLoading(true)
      const { user } = session

      const { data, error } = await supabase
        .from('profiles')
        .select(`full_name, avatar_url`)
        .eq('id', user.id)
        .single()

      if (!ignore) {
        if (data) {
          setFullName(data.full_name || '')
          setAvatarUrl(data.avatar_url || '')
        }
        setLoading(false)
      }
    }

    getProfile()
    return () => {
      ignore = true
    }
  }, [session])

  async function updateProfile() {
    try {
      setSaving(true)
      const { user } = session

      const updates = {
        id: user.id,
        full_name: fullName,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function uploadAvatar(event) {
    try {
      setSaving(true)
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      const updates = {
        id: session.user.id,
        avatar_url: data.publicUrl,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error

      setAvatarUrl(data.publicUrl)
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-paper w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-edge animate-slide-up">
        <div className="p-5 border-b border-edge flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Your Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-paper-warm rounded-full transition-colors text-ink-muted hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-coral animate-spin" />
            </div>
          ) : (
            <>
              {/* Avatar section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-paper-warm border border-edge flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-ink-muted">
                        {(fullName || session.user.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-ink/50 text-paper rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Upload className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={saving}
                      className="hidden"
                    />
                  </label>
                </div>
                {saving && <span className="text-xs text-coral animate-pulse">Uploading...</span>}
              </div>

              {/* Form section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-paper px-4 py-2.5 rounded-xl border border-edge focus:border-coral focus:ring-1 focus:ring-coral transition-all outline-none text-ink placeholder:text-ink-muted/50"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-soft mb-1.5">
                    Email
                  </label>
                  <input
                    type="text"
                    value={session.user.email}
                    disabled
                    className="w-full bg-paper-warm px-4 py-2.5 rounded-xl border border-edge text-ink-muted cursor-not-allowed"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    onClick={onSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-coral hover:bg-coral/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                  <button
                    onClick={updateProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-ink text-paper text-sm font-medium rounded-xl hover:bg-ink-soft transition-colors flex items-center justify-center min-w-[100px]"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
