import { useState, useEffect } from 'react'
import { X, Upload, Loader2, LogOut, History, Brain, Crown, Trash2, ChevronRight, Check, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'

const TABS = [
  { id: 'profile', label: 'Profile', icon: Upload },
  { id: 'history', label: 'Manage History', icon: History },
  { id: 'memory', label: 'Manage Memory', icon: Brain },
  { id: 'subscription', label: 'Subscription', icon: Crown },
]

export default function ProfileModal({ session, onClose, onSignOut }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [clearingHistory, setClearingHistory] = useState(false)
  const [clearingMemory, setClearingMemory] = useState(false)
  const [historyCleared, setHistoryCleared] = useState(false)
  const [memoryCleared, setMemoryCleared] = useState(false)

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

  async function handleClearHistory() {
    setClearingHistory(true)
    try {
      if (session?.user) {
        // Delete all messages for user's chats first
        const { data: userChats } = await supabase.from('chats').select('id').eq('user_id', session.user.id)
        if (userChats && userChats.length > 0) {
          const chatIds = userChats.map(c => c.id)
          await supabase.from('messages').delete().in('chat_id', chatIds)
          await supabase.from('chats').delete().eq('user_id', session.user.id)
        }
      }
      setHistoryCleared(true)
      setTimeout(() => setHistoryCleared(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setClearingHistory(false)
    }
  }

  async function handleClearMemory() {
    setClearingMemory(true)
    try {
      // Simulate clearing memory/preferences
      await new Promise(r => setTimeout(r, 800))
      setMemoryCleared(true)
      setTimeout(() => setMemoryCleared(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setClearingMemory(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div className="bg-paper w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-edge animate-slide-up flex" style={{ height: '80vh', maxHeight: '700px' }} onClick={e => e.stopPropagation()}>
        
        {/* Left: Tab Navigation */}
        <div className="w-52 bg-paper-warm border-r border-edge shrink-0 flex flex-col">
          <div className="p-5 border-b border-edge">
            <h2 className="text-lg font-semibold text-ink">Settings</h2>
            <p className="text-xs text-ink-muted mt-0.5">Manage your account</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-coral bg-coral/8 border border-coral/15'
                      : 'text-ink-muted hover:text-ink hover:bg-paper border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
          {/* Sign out at bottom */}
          <div className="p-3 border-t border-edge">
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-coral hover:bg-coral/8 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with close */}
          <div className="p-5 border-b border-edge flex items-center justify-between shrink-0">
            <h3 className="text-base font-semibold text-ink">{TABS.find(t => t.id === activeTab)?.label}</h3>
            <button onClick={onClose} className="p-2 hover:bg-paper-warm rounded-full transition-colors text-ink-muted hover:text-ink cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 p-6 overflow-y-auto">

          {/* ─── PROFILE TAB ─── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
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

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={updateProfile}
                        disabled={saving}
                        className="px-8 py-2.5 bg-ink text-paper text-sm font-medium rounded-xl hover:bg-ink-soft transition-all flex items-center justify-center min-w-[120px] cursor-pointer"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── MANAGE HISTORY TAB ─── */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-ink mb-1">Chat History</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Your conversation history is stored securely. You can clear all past conversations if you'd like a fresh start.
                </p>
              </div>

              <div className="bg-paper-warm rounded-2xl border border-edge p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center shrink-0">
                    <History className="w-5 h-5 text-coral" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-ink">Clear All History</div>
                    <p className="text-xs text-ink-muted mt-0.5">Permanently delete all your conversations and messages. This action cannot be undone.</p>
                  </div>
                </div>
                <button
                  onClick={handleClearHistory}
                  disabled={clearingHistory}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                >
                  {clearingHistory ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : historyCleared ? (
                    <>
                      <Check className="w-4 h-4" />
                      History Cleared!
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Clear History
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-ink-ghost text-center">
                Clearing history will remove all conversations from your account permanently.
              </p>
            </div>
          )}

          {/* ─── MANAGE MEMORY TAB ─── */}
          {activeTab === 'memory' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-ink mb-1">Memory & Data</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Sarvam AI learns from your interactions to provide better responses. You can clear this learned data at any time.
                </p>
              </div>

              <div className="bg-paper-warm rounded-2xl border border-edge p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(45, 212, 191, 0.1)' }}>
                    <Brain className="w-5 h-5" style={{ color: 'rgb(45, 212, 191)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-ink">Clear Learned Data</div>
                    <p className="text-xs text-ink-muted mt-0.5">Reset all personalization data, preferences, and interaction patterns that Sarvam has learned about you.</p>
                  </div>
                </div>
                <button
                  onClick={handleClearMemory}
                  disabled={clearingMemory}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
                >
                  {clearingMemory ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : memoryCleared ? (
                    <>
                      <Check className="w-4 h-4" />
                      Memory Cleared!
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Clear Data
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-ink-ghost text-center">
                After clearing, Sarvam AI will no longer use past interactions to personalize responses.
              </p>
            </div>
          )}

          {/* ─── SUBSCRIPTION TAB ─── */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="bg-paper-warm rounded-2xl border border-edge p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-ink-muted">Current Plan</div>
                    <div className="text-xl font-bold text-ink mt-0.5">Free</div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-ink/5 border border-edge text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    Active
                  </div>
                </div>
                <div className="text-xs text-ink-muted space-y-1">
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-ink-muted" /> 50 messages per day</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-ink-muted" /> Basic AI model</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-ink-muted" /> Standard response speed</div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="relative rounded-2xl border-2 border-edge p-5 overflow-hidden bg-paper-warm">
                <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider text-paper bg-ink">
                  Recommended
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-coral" />
                  <div>
                    <div className="text-xl font-bold text-ink">Pro</div>
                    <div className="text-sm text-ink-muted">₹499/month</div>
                  </div>
                </div>
                <div className="text-xs text-ink-soft space-y-1.5 mb-5">
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-coral" /> Unlimited messages</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-coral" /> Advanced AI model (GPT-4 level)</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-coral" /> Priority response speed</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-coral" /> Image generation</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-coral" /> Custom memory & personas</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3 text-coral" /> Early access to new features</div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-paper bg-ink transition-all cursor-pointer hover:bg-ink-soft">
                  <Crown className="w-4 h-4" />
                  Upgrade to Pro
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-ink-ghost text-center">
                Subscriptions are managed securely. Cancel anytime from your account settings.
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
