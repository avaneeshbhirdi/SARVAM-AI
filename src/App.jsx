import { useState, useEffect, useRef, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import {
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

/* ═══════════════════════════════════════════════════════════════════
   GENERATIVE CANVAS — Animated Wave Bars (Transient Senses inspired)
   ═══════════════════════════════════════════════════════════════════ */
function GenerativeCanvas({ className = '', interactionY = 0, isActive = false }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const timeRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      }
    }
    canvas.addEventListener('mousemove', handleMouse)

    const draw = () => {
      timeRef.current += 0.008
      const t = timeRef.current
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.clearRect(0, 0, w, h)

      // ─── Vertical Gradient Bars (Transient Senses) ───
      const barCount = Math.floor(w / 6)
      const barWidth = 2.5

      for (let i = 0; i < barCount; i++) {
        const x = (i / barCount) * w
        const normalX = i / barCount

        // Wave displacement — multiple sine waves layered
        const wave1 = Math.sin(normalX * 4 + t * 1.2) * 0.3
        const wave2 = Math.sin(normalX * 7 - t * 0.8) * 0.15
        const wave3 = Math.sin(normalX * 12 + t * 2) * 0.08
        const wave = wave1 + wave2 + wave3

        // Mouse influence — bars react to cursor proximity
        const distToMouse = Math.abs(normalX - mx)
        const mouseInfluence = Math.max(0, 1 - distToMouse * 4) * 0.3
        const mouseWave = mouseInfluence * Math.sin(t * 3 + normalX * 10)

        // Combined height
        const barHeight = (0.15 + Math.abs(wave + mouseWave) * 0.65) * h * 0.4
        const yOffset = h * 0.5 - barHeight * 0.5 + wave * h * 0.12

        // Color — shifting gradient from coral → amber → teal
        const hue = 10 + normalX * 170 + Math.sin(t * 0.5 + normalX * 3) * 20
        const saturation = 65 + Math.sin(t + normalX * 5) * 15
        const lightness = 55 + wave * 15

        // Opacity — fade at edges, stronger in center
        const edgeFade = Math.sin(normalX * Math.PI) * 0.7
        const opacity = (0.08 + edgeFade * 0.15 + mouseInfluence * 0.2) *
          (isActive ? 1.3 : 1)

        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`
        ctx.fillRect(x, yOffset, barWidth, barHeight)
      }

      // ─── Dot Matrix Scatter (Reboot inspired) ───
      const dotCount = 80
      for (let i = 0; i < dotCount; i++) {
        const seed = i * 137.5
        const dx = ((seed * 7.3) % w)
        const baseY = ((seed * 13.7) % h)
        const dy = baseY + Math.sin(t * 0.8 + i * 0.3) * 15

        const distFromCenter = Math.sqrt(
          Math.pow((dx / w - 0.5), 2) + Math.pow((dy / h - 0.5), 2)
        )
        const dotOpacity = Math.max(0, 0.12 - distFromCenter * 0.15)
          * (0.5 + Math.sin(t + i) * 0.5)

        const dotSize = 1.5 + Math.sin(t * 1.5 + i * 0.5) * 1

        ctx.fillStyle = `rgba(13, 13, 13, ${dotOpacity})`
        ctx.beginPath()
        ctx.arc(dx, dy, dotSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // ─── Flowing Thread Lines (Mantis wireframe inspired) ───
      const threadCount = 5
      for (let j = 0; j < threadCount; j++) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(13, 13, 13, ${0.03 + j * 0.008})`
        ctx.lineWidth = 0.8

        for (let x = 0; x <= w; x += 3) {
          const nx = x / w
          const baseY = h * (0.3 + j * 0.1)
          const y = baseY +
            Math.sin(nx * 5 + t * (0.5 + j * 0.2) + j) * 30 +
            Math.sin(nx * 11 - t * 0.7 + j * 2) * 15 +
            Math.cos(nx * 3 + t * 0.3) * 20

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouse)
    }
  }, [isActive])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ opacity: 0.9 }}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════════
   LOGO — Thread orb mark + sarvam.ai text
   ═══════════════════════════════════════════════════════════════════ */
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-1.5 group cursor-pointer select-none no-underline">
      <img
        src={logoSvg}
        alt="Sarvam AI"
        className="w-8 h-8 rounded-lg transition-transform duration-500 group-hover:scale-105"
      />
      <span className="text-[17px] font-semibold tracking-[-0.03em] text-ink">
        sarvam<span className="text-coral">.ai</span>
      </span>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════ */
function Navbar({ session, onToggleSidebar, onOpenProfile }) {
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
  }, [session])

  return (
    <nav id="main-navbar" className="fixed top-0 left-0 right-0 z-50 bg-paper/80 backdrop-blur-xl border-b border-edge/60">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
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
          ) : (
            <>
              <button
                id="login-btn"
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-full text-sm font-medium text-ink-soft hover:text-ink hover:bg-paper-warm border border-transparent hover:border-edge transition-all duration-300 cursor-pointer"
              >
                Log in
              </button>
              <button
                id="signup-btn"
                onClick={() => navigate('/signup')}
                className="px-4 py-2 rounded-full bg-ink text-paper text-sm font-medium hover:bg-ink-soft transition-colors duration-300 cursor-pointer"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   TYPING INDICATOR — Pulsing vertical bars
   ═══════════════════════════════════════════════════════════════════ */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-[3px] h-5 px-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full accent-gradient"
          style={{
            animation: `pulse-bar 1.2s ease-in-out ${i * 0.12}s infinite`,
            height: '16px',
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   CHAT MESSAGE — Editorial style
   ═══════════════════════════════════════════════════════════════════ */
function ChatMessage({ message, index }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`${isUser ? 'animate-slide-right' : 'animate-slide-left'}`}
      style={{ animationDelay: `${index * 0.04}s`, opacity: 0 }}
    >
      <div className={`flex gap-4 py-5 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Indicator line instead of avatar */}
        <div className="shrink-0 flex flex-col items-center pt-1">
          {isUser ? (
            <div className="w-7 h-7 rounded-full bg-ink text-paper flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
          ) : (
            <img src={logoSvg} alt="Sarvam AI" className="w-7 h-7 rounded-full" />
          )}
          {/* Thread line */}
          <div className={`w-[1.5px] flex-1 mt-2 rounded-full ${
            isUser ? 'bg-ink/8' : 'bg-gradient-to-b from-coral/30 to-transparent'
          }`} />
        </div>

        {/* Content */}
        <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
            isUser ? 'text-ink-muted' : 'accent-gradient-text'
          }`}>
            {isUser ? 'You' : 'Sarvam'}
          </span>
          <div className={`mt-2 text-[15px] leading-[1.7] text-ink-soft whitespace-pre-wrap break-words ${
            isUser ? 'font-medium text-ink' : ''
          }`}>
            {message.content}
          </div>
        </div>
      </div>

      {/* Separator */}
      {!isUser && (
        <div className="h-px bg-gradient-to-r from-transparent via-edge to-transparent ml-11" />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SUGGESTION CARDS — Minimal editorial
   ═══════════════════════════════════════════════════════════════════ */
const SUGGESTIONS = [
  {
    icon: BrainCircuit,
    label: 'Reason',
    prompt: 'Explain quantum computing in simple terms',
    color: 'text-coral',
  },
  {
    icon: Pen,
    label: 'Write',
    prompt: 'Draft a professional email requesting a deadline extension',
    color: 'text-amber',
  },
  {
    icon: Cpu,
    label: 'Code',
    prompt: 'Build a Python REST API with FastAPI',
    color: 'text-teal',
  },
  {
    icon: ImageIcon,
    label: 'Create',
    prompt: 'Compare React, Vue, and Svelte frameworks',
    color: 'text-mint',
  },
]

function SuggestionCard({ icon: Icon, label, prompt, color, onClick, index }) {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="card-editorial group rounded-2xl p-5 text-left cursor-pointer animate-fade-up"
      style={{ animationDelay: `${0.3 + index * 0.08}s`, opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <Icon className={`w-5 h-5 ${color} transition-transform duration-300 group-hover:scale-110`} />
        <CornerDownLeft className="w-3.5 h-3.5 text-ink-whisper opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="text-[13px] font-semibold text-ink tracking-[-0.01em] mb-1">
        {label}
      </div>
      <div className="text-[13px] text-ink-muted leading-relaxed line-clamp-2">
        {prompt}
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   HERO — Editorial landing with generative background
   ═══════════════════════════════════════════════════════════════════ */
function HeroSection({ onSuggestionClick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 pb-8 relative">
      {/* Generative canvas background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GenerativeCanvas />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        {/* Headline */}
        <div className="mb-10 animate-fade-up" style={{ opacity: 0, animationDelay: '0.1s' }}>
          <h1 className="text-[clamp(2.2rem,6vw,4.2rem)] font-display font-normal leading-[1.05] tracking-[-0.03em] text-ink mb-4">
            Imagine anything. Create{' '}
            <span className="italic accent-gradient-text animate-gradient-flow">
              Sarvam
            </span>
          </h1>
          <p className="text-ink-muted text-[15px] sm:text-base max-w-sm mx-auto leading-relaxed">
            Ask anything. Watch ideas materialize through neural threads of reasoning.
          </p>
        </div>

        {/* Suggestion grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {SUGGESTIONS.map((s, i) => (
            <SuggestionCard
              key={i}
              index={i}
              icon={s.icon}
              label={s.label}
              prompt={s.prompt}
              color={s.color}
              onClick={onSuggestionClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PROMPT INPUT — Clean with warm accent
   ═══════════════════════════════════════════════════════════════════ */
function PromptInput({ value, onChange, onSubmit, isLoading }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 180) + 'px'
    }
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pb-5 sm:pb-6">
      <div className={`relative rounded-2xl bg-card border transition-all duration-400 input-focus-ring ${
        value ? 'border-coral/30' : 'border-edge'
      }`}>
        <textarea
          ref={textareaRef}
          id="main-prompt-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          rows={1}
          className="w-full resize-none bg-transparent text-ink placeholder-ink-ghost text-[15px] leading-relaxed pl-5 pr-14 py-4 rounded-2xl focus:outline-none"
          disabled={isLoading}
        />

        <button
          id="send-message-btn"
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className={`absolute right-3 bottom-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
            value.trim() && !isLoading
              ? 'accent-gradient text-white shadow-md shadow-coral/15 hover:shadow-coral/25 hover:scale-105 active:scale-95'
              : 'bg-paper-warm text-ink-whisper cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </button>
      </div>

      <p className="text-center text-ink-ghost text-[11px] mt-2.5 tracking-wide">
        Press <kbd className="px-1.5 py-0.5 rounded bg-paper-warm border border-edge text-ink-muted text-[10px] font-mono">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded bg-paper-warm border border-edge text-ink-muted text-[10px] font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   AI RESPONSES — Demo content
   ═══════════════════════════════════════════════════════════════════ */
const AI_RESPONSES = {
  'Explain quantum computing in simple terms':
    "Think of it this way.\n\nA classical bit is a light switch — it's either ON or OFF. A qubit is more like a dimmer switch spinning freely between every position at once. This is superposition.\n\nNow imagine two dimmer switches that are mysteriously linked across any distance. Turn one, and the other instantly responds. That's entanglement.\n\nQuantum computers harness these properties to explore vast solution spaces simultaneously. They excel at:\n\n• Breaking and creating encryption\n• Simulating molecular structures for drug discovery\n• Optimizing complex logistics and supply chains\n• Accelerating machine learning algorithms\n\nThey won't replace your laptop — they solve fundamentally different problems. Think of them as a specialized tool, like a telescope for computation.",

  'Draft a professional email requesting a deadline extension':
    "Subject: Request for Timeline Adjustment — [Project Name]\n\nHi [Name],\n\nI wanted to reach out proactively regarding the [Project Name] deadline on [Date].\n\nDuring the implementation phase, we identified [specific challenge] that requires additional attention to maintain the quality standards we've established. Rather than compromise on deliverable quality, I'd like to propose extending the timeline by [X days].\n\nCurrent progress:\n→ Phase 1: Complete\n→ Phase 2: 85% complete\n→ Phase 3: Pending (blocked by above)\n\nProposed new deadline: [New Date]\n\nI'm happy to provide daily progress updates and am available to discuss alternative approaches if the original timeline is firm.\n\nBest,\n[Your Name]",

  'Build a Python REST API with FastAPI':
    "Here's a production-ready structure:\n\n```python\nfrom fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\nfrom typing import Optional\n\napp = FastAPI(title=\"Sarvam API\", version=\"1.0\")\n\nclass Item(BaseModel):\n    name: str\n    description: Optional[str] = None\n    price: float\n    in_stock: bool = True\n\ndb: dict[int, Item] = {}\n\n@app.post(\"/items/\", status_code=201)\ndef create(item: Item):\n    id = len(db) + 1\n    db[id] = item\n    return {\"id\": id, **item.model_dump()}\n\n@app.get(\"/items/{id}\")\ndef read(id: int):\n    if id not in db:\n        raise HTTPException(404, \"Not found\")\n    return db[id]\n\n@app.get(\"/items/\")\ndef list_all():\n    return [{\"id\": k, **v.model_dump()} for k, v in db.items()]\n```\n\nRun: `uvicorn main:app --reload`\nDocs: Visit `/docs` for auto-generated Swagger UI.",

  'Compare React, Vue, and Svelte frameworks':
    "Three philosophies, one goal.\n\nReact — The ecosystem giant\n→ Virtual DOM, JSX, \"just JavaScript\"\n→ 42KB gzipped · Massive community\n→ Best for: Large teams, complex apps, extensive library needs\n→ Trade-off: Boilerplate, decision fatigue\n\nVue — The progressive choice\n→ Template-based, reactive by default\n→ 33KB gzipped · Curated ecosystem\n→ Best for: Rapid prototyping, gradual adoption\n→ Trade-off: Smaller job market, less third-party variety\n\nSvelte — The compiler approach\n→ No virtual DOM, compiles to vanilla JS\n→ ~2KB runtime · Growing community\n→ Best for: Performance-critical apps, smaller bundles\n→ Trade-off: Younger ecosystem, fewer resources\n\nMy take: React for career versatility. Vue for developer happiness. Svelte for raw performance. All three are excellent — your choice depends on your constraints, not the framework's capabilities.",
}

function getAIResponse(userMessage) {
  if (AI_RESPONSES[userMessage]) return AI_RESPONSES[userMessage]

  return `You asked: "${userMessage.slice(0, 80)}${userMessage.length > 80 ? '...' : ''}"\n\nThis is a frontend demo — the neural threads are visualized, but I'm not yet connected to a reasoning backend.\n\nTry one of the suggestion cards to see a full response. When connected to your AI backend, I'll weave real-time threads of thought into every answer.`
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════
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

/* ═══════════════════════════════════════════════════════════════════
   HOME PAGE — Chat interface
   ═══════════════════════════════════════════════════════════════════ */
function Home() {
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
  }, [isLoading, activeChatId, session])

  const handleSubmit = useCallback(() => {
    sendMessage(input)
  }, [input, sendMessage])

  const handleSuggestionClick = useCallback((text) => {
    setInput(text)
    setTimeout(() => sendMessage(text), 120)
  }, [sendMessage])

  return (
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
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
        {hasMessages ? (
          /* ─── Chat Mode ─── */
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto hide-scrollbar py-6">
              <div className="max-w-2xl mx-auto px-4 sm:px-5">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} message={msg} index={i} />
                ))}

                {isLoading && (
                  <div className="animate-slide-left" style={{ opacity: 0 }}>
                    <div className="flex gap-4 py-5">
                      <div className="shrink-0">
                        <img src={logoSvg} alt="Sarvam AI" className="w-7 h-7 rounded-full" />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] accent-gradient-text">
                          Sarvam
                        </span>
                        <div className="mt-2">
                          <TypingIndicator />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Bottom input */}
            <div className="sticky bottom-0 bg-gradient-to-t from-paper via-paper/95 to-transparent pt-8">
              <PromptInput
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : (
          /* ─── Welcome Mode ─── */
          <div className="flex-1 flex flex-col">
            <HeroSection onSuggestionClick={handleSuggestionClick} />
            <PromptInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   APP — Router root
   ═══════════════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}
