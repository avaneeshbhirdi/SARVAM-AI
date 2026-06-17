import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# 1. Add imports
imports = """import {
  ArrowUp,
  Sparkles,
  User,
  Loader2,
  Cpu,
  Pen,
  Image as ImageIcon,
  BrainCircuit,
  CornerDownLeft,
  Menu,
  MessageSquare,
  Plus
} from 'lucide-react'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import logoSvg from './assets/logo.svg'
import { supabase } from './lib/supabase'
import ProfileModal from './components/ProfileModal.jsx'
"""
content = re.sub(r'import \{[\s\S]*?\} from \'lucide-react\'\nimport Login from \'./pages/Login.jsx\'\nimport Signup from \'./pages/Signup.jsx\'\nimport logoSvg from \'./assets/logo.svg\'\nimport \{ supabase \} from \'./lib/supabase\'\n', imports, content)

# 2. Update Navbar to accept props
navbar_old = """function Navbar() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }"""

navbar_new = """function Navbar({ session, onToggleSidebar, onOpenProfile }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (session?.user) {
      supabase.from('profiles').select('full_name, avatar_url').eq('id', session.user.id).single()
        .then(({data}) => {
           if (data) setProfile(data)
        })
    } else {
      setProfile(null)
    }
  }, [session])"""
content = content.replace(navbar_old, navbar_new)

navbar_render_old = """        <div className="flex items-center gap-2">
          {session ? (
            <>
              <span className="text-sm font-medium text-ink mr-2 hidden sm:inline">
                {session.user.user_metadata?.full_name || session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-full text-sm font-medium text-ink-soft hover:text-ink hover:bg-paper-warm border border-transparent hover:border-edge transition-all duration-300 cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : ("""

navbar_render_new = """        <div className="flex items-center gap-4">
          {session ? (
            <>
              <button onClick={onToggleSidebar} className="p-2 text-ink-muted hover:text-ink hover:bg-paper-warm rounded-full transition-colors md:hidden">
                <Menu className="w-5 h-5" />
              </button>
              <button onClick={onOpenProfile} className="flex items-center justify-center w-8 h-8 rounded-full bg-coral/10 text-coral hover:bg-coral/20 transition-colors border border-coral/20 cursor-pointer overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold">{(profile?.full_name || session.user.email).charAt(0).toUpperCase()}</span>
                )}
              </button>
            </>
          ) : ("""
content = content.replace(navbar_render_old, navbar_render_new)

# 3. Add Sidebar component
sidebar = """/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR — Chat History
   ═══════════════════════════════════════════════════════════════════ */
function Sidebar({ isOpen, onClose, chats, activeChatId, onSelectChat, onNewChat }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar container */}
      <div className={`fixed top-14 bottom-0 left-0 z-40 w-64 bg-paper-warm border-r border-edge transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-[calc(100vh-3.5rem)]`}>
        <div className="p-4">
          <button 
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-ink text-paper rounded-xl text-sm font-medium hover:bg-ink-soft transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar px-3 pb-4 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-ink-muted uppercase tracking-wider">History</div>
          {chats.length === 0 ? (
            <div className="px-3 py-4 text-sm text-ink-muted/60 italic">No previous chats</div>
          ) : (
            chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                  activeChatId === chat.id 
                    ? 'bg-paper text-ink shadow-sm border border-edge/50' 
                    : 'text-ink-soft hover:bg-paper/50 hover:text-ink border border-transparent'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">{chat.title}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}
"""
content = content.replace('/* ═══════════════════════════════════════════════════════════════════\n   HOME PAGE — Chat interface', sidebar + '\n/* ═══════════════════════════════════════════════════════════════════\n   HOME PAGE — Chat interface')

# 4. Update Home to manage state and Supabase queries
home_old = """function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef(null)

  const hasMessages = messages.length > 0

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const sendMessage = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: getAIResponse(trimmed) },
      ])
      setIsLoading(false)
    }, 1000 + Math.random() * 800)
  }, [isLoading])"""

home_new = """function Home() {
  const [session, setSession] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef(null)

  const hasMessages = messages.length > 0

  // Auth Effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fetch Chats Effect
  useEffect(() => {
    if (session?.user) {
      supabase.from('chats').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setChats(data)
        })
    } else {
      setChats([])
      setActiveChatId(null)
      setMessages([])
    }
  }, [session])

  // Fetch Messages Effect
  useEffect(() => {
    if (activeChatId) {
      supabase.from('messages').select('*').eq('chat_id', activeChatId).order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data) setMessages(data)
        })
    } else {
      setMessages([])
    }
  }, [activeChatId])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const handleSignOut = async () => {
    setIsProfileOpen(false)
    await supabase.auth.signOut()
  }

  const handleNewChat = () => {
    setActiveChatId(null)
    setMessages([])
    if (window.innerWidth < 768) setIsSidebarOpen(false)
  }

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    setInput('')
    setIsLoading(true)
    
    let currentChatId = activeChatId
    
    // Optimistic UI
    const newUserMsg = { role: 'user', content: trimmed, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, newUserMsg])

    try {
      if (!currentChatId && session?.user) {
        // Create new chat
        const title = trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({ user_id: session.user.id, title })
          .select()
          .single()
        
        if (!chatError && newChat) {
          currentChatId = newChat.id
          setActiveChatId(currentChatId)
          setChats(prev => [newChat, ...prev])
        }
      }

      // Save user message to DB
      if (currentChatId && session?.user) {
        await supabase.from('messages').insert({ chat_id: currentChatId, role: 'user', content: trimmed })
      }

      // Get AI Response
      const aiResponseText = getAIResponse(trimmed)
      
      // Simulate delay for demo
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 800))
      
      const newAiMsg = { role: 'assistant', content: aiResponseText, created_at: new Date().toISOString() }
      setMessages((prev) => [...prev, newAiMsg])
      
      // Save AI message to DB
      if (currentChatId && session?.user) {
        await supabase.from('messages').insert({ chat_id: currentChatId, role: 'assistant', content: aiResponseText })
      }
      
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, activeChatId, session])"""
content = content.replace(home_old, home_new)

# 5. Update Home return statement to include Sidebar and ProfileModal
home_return_old = """  return (
    <div className="min-h-screen flex flex-col bg-paper relative">
      {/* Subtle dot matrix background */}
      <div className="fixed inset-0 dot-matrix pointer-events-none" />

      <Navbar />

      <main className="relative flex-1 flex flex-col pt-14">"""

home_return_new = """  return (
    <div className="min-h-screen flex flex-col bg-paper relative">
      {isProfileOpen && <ProfileModal session={session} onClose={() => setIsProfileOpen(false)} onSignOut={handleSignOut} />}
      
      {/* Subtle dot matrix background */}
      <div className="fixed inset-0 dot-matrix pointer-events-none" />

      <Navbar 
        session={session} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onOpenProfile={() => setIsProfileOpen(true)} 
      />

      <div className="flex-1 flex pt-14 relative z-10">
        {session && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            chats={chats} 
            activeChatId={activeChatId}
            onSelectChat={(id) => { setActiveChatId(id); if (window.innerWidth < 768) setIsSidebarOpen(false) }}
            onNewChat={handleNewChat}
          />
        )}
        
        <main className="flex-1 flex flex-col relative overflow-hidden">"""
content = content.replace(home_return_old, home_return_new)

with open('src/App.jsx', 'w') as f:
    f.write(content)
