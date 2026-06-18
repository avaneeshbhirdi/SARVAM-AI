import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  Plus,
  PanelLeftClose,
  PanelLeft,
  Star,
  Pencil,
  Check,
  X,
  MoreHorizontal,
  Trash2,
  ChevronsLeft,
  ChevronsRight,
  Pin,
  PinOff,
  Lightbulb,
  Paperclip,
  Brain,
  Lock,
  Zap
} from 'lucide-react'
import Auth from './pages/Auth.jsx'
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
function Logo({ collapsed = false }) {
  return (
    <Link to="/" className="flex items-center gap-1.5 group cursor-pointer select-none no-underline">
      <img
        src={logoSvg}
        alt="Sarvam AI"
        className="w-8 h-8 rounded-lg transition-transform duration-500 group-hover:scale-105 shrink-0"
      />
      {!collapsed && (
        <span className="text-[17px] font-semibold tracking-[-0.03em] text-ink whitespace-nowrap">
          sarvam<span style={{ color: '#D4690A' }}>.ai</span>
        </span>
      )}
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PROFILE BUTTON
   ═══════════════════════════════════════════════════════════════════ */
function ProfileButton({ session, onOpenProfile }) {
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
    <button onClick={(e) => { e.stopPropagation(); onOpenProfile(); }} className="flex items-center justify-center w-8 h-8 rounded-full bg-coral/10 text-coral hover:bg-coral/20 transition-colors border border-coral/20 cursor-pointer overflow-hidden shrink-0">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm font-semibold">{(profile?.full_name || session?.user?.email)?.charAt(0).toUpperCase()}</span>
      )}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════ */
function Navbar({ session, onOpenProfile, isSidebarOpen, sessionLoading }) {
  const navigate = useNavigate()

  // Navbar always spans full width now - sidebar overlays on top
  return (
    <nav id="main-navbar" className="fixed top-0 left-0 right-0 z-40 bg-paper/80 backdrop-blur-xl border-b border-edge/60">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {!session && !sessionLoading && (
            <>
              <Logo />
              <div className="hidden md:flex items-center gap-6 ml-4">
                <Link to="/" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors no-underline">About Us</Link>
                <Link to="/" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors no-underline">Features</Link>
                <Link to="/" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors no-underline">Pricing</Link>
                <Link to="/" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors no-underline">API</Link>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!session && !sessionLoading && (
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
function ChatMessage({ message, index, userProfile, session }) {
  const isUser = message.role === 'user'
  const initial = (userProfile?.full_name || session?.user?.email || 'U').charAt(0).toUpperCase()

  return (
    <div
      className={`${isUser ? 'animate-slide-right' : 'animate-slide-left'}`}
      style={{ animationDelay: `${index * 0.04}s`, opacity: 0 }}
    >
      <div className={`flex gap-4 py-5 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className="shrink-0 flex flex-col items-center pt-1">
          {isUser ? (
            <div className="w-7 h-7 rounded-full bg-coral/10 text-coral flex items-center justify-center border border-coral/20 overflow-hidden">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="You" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-semibold">{initial}</span>
              )}
            </div>
          ) : (
            <img src={logoSvg} alt="Sarvam AI" className="w-7 h-7 rounded-full" />
          )}
          <div className={`w-[1.5px] flex-1 mt-2 rounded-full ${
            isUser ? 'bg-ink/8' : 'bg-gradient-to-b from-coral/30 to-transparent'
          }`} />
        </div>

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
  const [tipIndex, setTipIndex] = useState(0)
  const [tipFade, setTipFade] = useState(true)

  const tips = useMemo(() => [
    { text: 'Press', kbd: 'Enter', suffix: 'to send ·', kbd2: 'Shift+Enter', suffix2: 'for new line' },
    { icon: Lightbulb, text: 'Try asking Sarvam to explain complex topics in simple terms' },
    { icon: Paperclip, text: 'You can drag and drop files here to share with Sarvam' },
    { icon: Star, text: 'Star your favourite chats to find them quickly later' },
    { icon: Brain, text: 'Sarvam learns from your conversations to give better answers' },
    { icon: Pencil, text: 'Hover on any chat to rename it for easy organization' },
    { icon: Lock, text: 'Your conversations are private and encrypted end-to-end' },
    { icon: Zap, text: 'Use the suggestion cards above for quick prompts' },
  ], [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTipFade(false)
      setTimeout(() => {
        setTipIndex(prev => (prev + 1) % tips.length)
        setTipFade(true)
      }, 250)
    }, 4000)
    return () => clearInterval(interval)
  }, [tips.length])

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

  const tip = tips[tipIndex]

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
      <div className="text-center mt-2.5 h-5 overflow-hidden flex items-center justify-center">
        <p className={`text-ink-ghost text-[11px] tracking-wide transition-all duration-250 flex items-center gap-1.5 ${tipFade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          {tip.kbd ? (
            <>
              {tip.text} <kbd className="px-1.5 py-0.5 rounded bg-paper-warm border border-edge text-ink-muted text-[10px] font-mono">{tip.kbd}</kbd> {tip.suffix} <kbd className="px-1.5 py-0.5 rounded bg-paper-warm border border-edge text-ink-muted text-[10px] font-mono">{tip.kbd2}</kbd> {tip.suffix2}
            </>
          ) : (
            <>
              {tip.icon && <tip.icon className="w-3 h-3 opacity-80" />}
              {tip.text}
            </>
          )}
        </p>
      </div>
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
   CHAT ITEM — With star, rename, delete actions
   ═══════════════════════════════════════════════════════════════════ */
function ChatItem({ chat, isActive, collapsed, onSelect, onToggleFavourite, onRename, onDelete, idx }) {
  const [showMenu, setShowMenu] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(chat.title)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue.trim() !== chat.title) {
      onRename(chat.id, renameValue.trim())
    }
    setIsRenaming(false)
  }

  if (collapsed) {
    return (
      <button
        onClick={() => onSelect(chat.id)}
        title={chat.title}
        className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 mx-auto ${
          isActive ? 'bg-coral/10 text-coral' : 'text-ink-muted hover:bg-paper-warm hover:text-ink'
        }`}
      >
        {chat.is_favourite ? <Star className="w-4 h-4 fill-current" /> : <MessageSquare className="w-4 h-4" />}
      </button>
    )
  }

  return (
    <div
      className={`group sidebar-item ripple-container w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer animate-list-item relative ${
        isActive
          ? 'bg-coral/8 text-ink font-medium border border-coral/15'
          : 'text-ink-soft hover:bg-paper-warm hover:text-ink border border-transparent'
      }`}
      style={{ animationDelay: `${idx * 0.04}s` }}
      onClick={() => { if (!isRenaming) onSelect(chat.id) }}
    >
      {/* Chat icon */}
      <MessageSquare className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isActive ? 'text-coral' : ''}`} />

      {/* Title or rename input */}
      {isRenaming ? (
        <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <input
            autoFocus
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setIsRenaming(false) }}
            className="flex-1 bg-paper border border-edge rounded-lg px-2 py-1 text-xs outline-none focus:border-coral text-ink"
          />
          <button onClick={handleRenameSubmit} className="p-1 text-teal hover:bg-teal/10 rounded cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setIsRenaming(false)} className="p-1 text-ink-muted hover:bg-paper-warm rounded cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <span className="truncate flex-1 text-left">{chat.title}</span>
      )}

      {/* Inline action icons — visible on hover */}
      {!isRenaming && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setIsRenaming(true); setRenameValue(chat.title) }}
            title="Rename"
            className="p-1 rounded hover:bg-paper hover:text-ink text-ink-ghost transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavourite(chat.id) }}
            title={chat.is_favourite ? 'Unfavourite' : 'Favourite'}
            className={`p-1 rounded transition-colors cursor-pointer ${
              chat.is_favourite ? 'text-amber hover:bg-amber/10' : 'text-ink-ghost hover:bg-paper hover:text-amber'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${chat.is_favourite ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR — Always visible, collapsible
   ═══════════════════════════════════════════════════════════════════ */
function Sidebar({ isOpen, onToggle, onHoverOpen, onHoverClose, isPinned, chats, activeChatId, onSelectChat, onNewChat, session, onOpenProfile, onToggleFavourite, onRenameChat, onDeleteChat, userProfile }) {
  const favouriteChats = chats.filter(c => c.is_favourite)
  const recentChats = chats.filter(c => !c.is_favourite)
  const initial = (userProfile?.full_name || session?.user?.email || 'U').charAt(0).toUpperCase()

  return (
    <div
      className={`fixed inset-y-0 left-0 z-[60] border-r border-edge/40 sidebar-spring flex flex-col backdrop-blur-xl ${!isOpen ? 'sidebar-collapsed' : ''}`}
      style={{ width: isOpen ? '288px' : '64px', boxShadow: '2px 0 16px rgba(0,0,0,0.04)', backgroundColor: 'rgba(243, 239, 233, 0.65)' }}
      onMouseEnter={onHoverOpen}
      onMouseLeave={onHoverClose}
    >
      {/* Logo Header */}
      <div className={`h-14 flex items-center border-b border-edge/30 shrink-0 ${isOpen ? 'px-5 justify-start' : 'justify-center'}`}>
        <Logo collapsed={!isOpen} />
      </div>

      {/* New Chat Button */}
      <div className={`shrink-0 ${isOpen ? 'px-4 pt-4 pb-2' : 'px-2 pt-3 pb-2'}`}>
        {isOpen ? (
          <button
            onClick={onNewChat}
            className="new-chat-btn w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer border border-edge/60 text-ink"
          >
            <Plus className="w-4 h-4 transition-transform duration-300" />
            New Chat
          </button>
        ) : (
          <button
            onClick={onNewChat}
            title="New Chat"
            className="toggle-btn w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-ink-muted hover:text-coral border border-edge/60 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Chat Lists */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-4 space-y-1 mt-1">
        {/* Favourites */}
        {favouriteChats.length > 0 && (
          <>
            {isOpen && <div className="px-2 mb-1 mt-1 text-[10px] font-semibold text-amber uppercase tracking-[0.12em] flex items-center gap-1.5"><Star className="w-3 h-3 fill-current" /> Favourites</div>}
            {favouriteChats.map((chat, idx) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                collapsed={!isOpen}
                onSelect={onSelectChat}
                onToggleFavourite={onToggleFavourite}
                onRename={onRenameChat}
                onDelete={onDeleteChat}
                idx={idx}
              />
            ))}
            {isOpen && <div className="h-px bg-edge/40 my-2 mx-2" />}
          </>
        )}

        {/* Recent / All */}
        {isOpen && <div className="px-2 mb-1 mt-1 text-[10px] font-semibold text-ink-muted uppercase tracking-[0.12em]">All Chats</div>}
        {recentChats.length === 0 && favouriteChats.length === 0 ? (
          isOpen ? (
            <div className="px-3 py-6 text-center">
              <MessageSquare className="w-8 h-8 text-ink-muted/30 mx-auto mb-2" />
              <div className="text-sm text-ink-muted/60">No conversations yet</div>
              <div className="text-[11px] text-ink-ghost mt-0.5">Start a new chat to begin</div>
            </div>
          ) : null
        ) : (
          recentChats.map((chat, idx) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChatId === chat.id}
              collapsed={!isOpen}
              onSelect={onSelectChat}
              onToggleFavourite={onToggleFavourite}
              onRename={onRenameChat}
              onDelete={onDeleteChat}
              idx={idx}
            />
          ))
        )}
      </div>

      {/* Bottom: Collapse toggle + Profile */}
      <div className="border-t border-edge/30 shrink-0">
        {/* Profile */}
        {isOpen ? (
          <div className="p-3 mx-2 mt-2 rounded-xl hover:bg-paper-warm transition-all cursor-pointer flex items-center gap-3 btn-press" onClick={onOpenProfile}>
            <div className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center border border-coral/20 overflow-hidden shrink-0">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold">{initial}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink truncate">
                  {userProfile?.full_name || session?.user?.email?.split('@')[0] || 'Profile'}
                </span>
                <span className="badge-hover shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-ink/5 text-ink-muted border border-edge/60">
                  Free
                </span>
              </div>
              <div className="text-[11px] text-ink-muted truncate">{session?.user?.email}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2 mt-1">
            <div onClick={onOpenProfile} className="w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer hover:bg-paper-warm transition-colors" title="Profile">
              <div className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center border border-coral/20 overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold">{initial}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pin/Unpin Toggle */}
        <div className={`flex ${isOpen ? 'justify-between items-center px-4' : 'justify-center'} py-2 pb-3`}>
          {isOpen && (
            <span className="text-[10px] text-ink-ghost uppercase tracking-wider">
              {isPinned ? 'Pinned' : 'Auto'}
            </span>
          )}
          <button
            onClick={onToggle}
            title={isPinned ? 'Unpin sidebar (auto mode)' : 'Pin sidebar open'}
            className={`toggle-btn p-2 rounded-lg cursor-pointer transition-all duration-200 ${isPinned ? 'text-coral bg-coral/8 hover:bg-coral/15' : 'text-ink-muted hover:text-ink'}`}
          >
            {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   HOME PAGE — Chat interface
   ═══════════════════════════════════════════════════════════════════ */
function Home() {
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)

  // Hover auto-open/close timers
  const hoverOpenTimer = useRef(null)
  const hoverCloseTimer = useRef(null)

  const handleHoverOpen = useCallback(() => {
    if (isSidebarPinned) return
    clearTimeout(hoverCloseTimer.current)
    hoverOpenTimer.current = setTimeout(() => setIsSidebarOpen(true), 50)
  }, [isSidebarPinned])

  const handleHoverClose = useCallback(() => {
    if (isSidebarPinned) return
    clearTimeout(hoverOpenTimer.current)
    hoverCloseTimer.current = setTimeout(() => setIsSidebarOpen(false), 80)
  }, [isSidebarPinned])

  const handleTogglePin = useCallback(() => {
    setIsSidebarPinned(prev => {
      if (prev) {
        // Unpinning: close sidebar
        setIsSidebarOpen(false)
        return false
      } else {
        // Pinning: keep sidebar open
        setIsSidebarOpen(true)
        return true
      }
    })
  }, [])

  // Toggle favourite
  const handleToggleFavourite = useCallback(async (chatId) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, is_favourite: !c.is_favourite } : c))
    // Persist to DB (best effort)
    const chat = chats.find(c => c.id === chatId)
    if (chat && session?.user) {
      supabase.from('chats').update({ is_favourite: !chat.is_favourite }).eq('id', chatId).then(() => {})
    }
  }, [chats, session])

  // Rename chat
  const handleRenameChat = useCallback(async (chatId, newTitle) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c))
    if (session?.user) {
      supabase.from('chats').update({ title: newTitle }).eq('id', chatId).then(() => {})
    }
  }, [session])

  // Delete chat
  const handleDeleteChat = useCallback(async (chatId) => {
    setChats(prev => prev.filter(c => c.id !== chatId))
    if (activeChatId === chatId) { setActiveChatId(null) }
    if (session?.user) {
      await supabase.from('messages').delete().eq('chat_id', chatId)
      await supabase.from('chats').delete().eq('id', chatId)
    }
  }, [session, activeChatId])
  
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef(null)

  const hasMessages = messages.length > 0

  // Auth Effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setSessionLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setSessionLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fetch Chats & Profile Effect
  useEffect(() => {
    if (session?.user) {
      supabase.from('chats').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setChats(data)
        })
      // Fetch profile once
      supabase.from('profiles').select('full_name, avatar_url').eq('id', session.user.id).single()
        .then(({ data }) => {
          if (data) setUserProfile(data)
        })
    } else {
      setChats([])
      setActiveChatId(null)
      setMessages([])
      setUserProfile(null)
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
        onOpenProfile={() => setIsProfileOpen(true)} 
        isSidebarOpen={isSidebarOpen}
        sessionLoading={sessionLoading}
      />

      {/* Sidebar — rendered at top level so its z-index works above navbar */}
      {session && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={handleTogglePin}
          onHoverOpen={handleHoverOpen}
          onHoverClose={handleHoverClose}
          isPinned={isSidebarPinned}
          chats={chats} 
          activeChatId={activeChatId}
          onSelectChat={(id) => { setActiveChatId(id); if (window.innerWidth < 768) setIsSidebarOpen(true) }}
          onNewChat={handleNewChat}
          session={session}
          onOpenProfile={() => setIsProfileOpen(true)}
          onToggleFavourite={handleToggleFavourite}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          userProfile={userProfile}
        />
      )}

      <div className="flex-1 flex pt-14 relative z-10">
        <main className="flex-1 flex flex-col relative overflow-hidden">
        {hasMessages ? (
          /* ─── Chat Mode ─── */
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto hide-scrollbar py-6">
              <div className="max-w-2xl mx-auto px-4 sm:px-5">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} message={msg} index={i} userProfile={userProfile} session={session} />
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
          /* ─── Empty State (Landing vs New Chat) ─── */
          <div className="flex-1 flex flex-col">
            <HeroSection onSuggestionClick={handleSuggestionClick} />
            <div className={session ? "mt-auto" : ""}>
              <PromptInput
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
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
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}
