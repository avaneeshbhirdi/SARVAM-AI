import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles, Zap, Star, Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import logoSvg from '../assets/logo.svg'
import { HighlightGroup, HighlighterItem, Particles } from '../components/ui/highlighter'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'

export default function Subscription() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [updating, setUpdating] = useState(false)
  const [wobbleDir, setWobbleDir] = useState(null)
  const [isAnnual, setIsAnnual] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login')
        return
      }
      setSession(session)
      
      supabase.from('profiles').select('plan').eq('id', session.user.id).single()
        .then(({ data }) => {
          if (data && data.plan) setCurrentPlan(data.plan)
          setLoading(false)
        })
    })
  }, [navigate])

  const handleUpgrade = (plan) => {
    if (plan === currentPlan) return
    navigate(`/payment?plan=${plan}&isAnnual=${isAnnual}`)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-paper"><Loader2 className="w-8 h-8 text-coral animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dot-matrix pointer-events-none opacity-50" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-paper/80 backdrop-blur-xl border-b border-edge/60">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-ink-muted hover:text-ink transition-colors rounded-full hover:bg-paper-warm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src={logoSvg} alt="Sarvam AI" className="w-6 h-6 rounded-lg" />
            <span className="text-base font-semibold text-ink">Subscription Plans</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 pt-28 pb-16 relative z-10">

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className={`bg-paper-warm p-1 rounded-2xl border border-edge inline-flex relative ${wobbleDir === 'right' ? 'animate-wobble-right' : wobbleDir === 'left' ? 'animate-wobble-left' : ''}`}>
            {/* Sliding background indicator */}
            <div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-paper shadow-sm rounded-xl border border-edge/60 transition-transform duration-300"
              style={{ 
                transform: isAnnual ? 'translateX(100%)' : 'translateX(0)',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
            
            <button 
              onClick={() => {
                if (isAnnual !== false) {
                  setIsAnnual(false);
                  setWobbleDir('left');
                  setTimeout(() => setWobbleDir(null), 400);
                }
              }}
              className={`relative z-10 w-32 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-300 ${!isAnnual ? 'text-ink' : 'text-ink-muted hover:text-ink-soft'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => {
                if (isAnnual !== true) {
                  setIsAnnual(true);
                  setWobbleDir('right');
                  setTimeout(() => setWobbleDir(null), 400);
                }
              }}
              className={`relative z-10 w-32 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 ${isAnnual ? 'text-ink' : 'text-ink-muted hover:text-ink-soft'}`}
            >
              Annually
              <span className="text-[10px] font-bold bg-coral/10 text-coral px-1.5 py-0.5 rounded-md">SAVE</span>
            </button>
          </div>
        </div>

        <HighlightGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-up group" refresh={isAnnual}>
          
          {/* Free Plan */}
          <HighlighterItem className="rounded-3xl h-full w-full">
            <div className={`h-full bg-paper-warm rounded-[23px] border ${currentPlan === 'free' ? 'border-coral/50 ring-2 ring-coral/20' : 'border-transparent'} p-8 flex flex-col relative transition-all duration-300`}>
              <Particles
                className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-1000 ease-in-out group-hover/item:opacity-100"
                quantity={50}
                color={"#14b8a6"}
                vy={-0.2}
              />
              {currentPlan === 'free' && <div className="absolute top-4 right-4 bg-coral text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full z-30">Current</div>}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-ink mb-2">Free</h2>
                <div className="text-3xl text-ink flex items-baseline">
                  <span className="font-[Poppins] font-bold">₹0</span>
                  <span className="text-sm font-normal text-ink-muted ml-0.5">/mo</span>
                </div>
              </div>
              <div className="space-y-4 mb-8 flex-1 text-sm text-ink-soft">
                <div className="flex items-start gap-3"><Check className="w-5 h-5 text-teal shrink-0" /><span>Limit upto 3 prompts per day</span></div>
                <div className="flex items-start gap-3 text-ink-ghost"><Check className="w-5 h-5 text-edge shrink-0" /><span>Cannot generate images</span></div>
                <div className="flex items-start gap-3 text-ink-ghost"><Check className="w-5 h-5 text-edge shrink-0" /><span>No audio input or output</span></div>
                <div className="flex items-start gap-3 text-ink-ghost"><Check className="w-5 h-5 text-edge shrink-0" /><span>No video generation</span></div>
                <div className="flex items-start gap-3"><Zap className="w-5 h-5 text-coral shrink-0" /><span>Model: <strong>Sarvam flash 2.5</strong></span></div>
              </div>
              <button 
                onClick={() => handleUpgrade('free')}
                disabled={currentPlan === 'free' || updating}
                className="relative z-40 w-full py-3 rounded-xl font-semibold bg-paper border border-edge text-ink hover:bg-paper-warm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentPlan === 'free' ? 'Active' : 'Downgrade'}
              </button>
            </div>
          </HighlighterItem>

          {/* Pro Plan */}
          <HighlighterItem className="rounded-3xl h-full w-full">
            <div className={`h-full bg-paper-warm rounded-[23px] border ${currentPlan === 'pro' ? 'border-amber ring-2 ring-amber/20' : 'border-transparent'} p-8 flex flex-col relative transition-all duration-300`}>
              <Particles
                className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-1000 ease-in-out group-hover/item:opacity-100"
                quantity={100}
                color={"#f59e0b"}
                vy={-0.2}
              />
              {currentPlan === 'pro' && <div className="absolute top-4 right-4 bg-amber text-ink text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full z-30">Current</div>}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber" />
                  <h2 className="text-2xl font-bold text-ink">Pro</h2>
                </div>
                <div className="text-3xl text-ink flex items-baseline">
                  <span className="font-[Poppins] font-bold">₹</span>
                  <span className="font-[Poppins] font-bold inline-block min-w-[2.5ch] text-left">
                    <AnimatedNumber value={isAnnual ? 299 : 399} />
                  </span>
                  <span className="text-sm font-normal text-ink-muted ml-0.5">/mo</span>
                </div>
                <div className="text-xs text-ink-muted mt-1">{isAnnual ? 'Billed annually' : 'Billed monthly'}</div>
              </div>
              <div className="space-y-4 mb-8 flex-1 text-sm text-ink-soft">
                <div className="flex items-start gap-3"><Check className="w-5 h-5 text-amber shrink-0" /><span>Limit upto 50 prompts per day</span></div>
                <div className="flex items-start gap-3"><Check className="w-5 h-5 text-amber shrink-0" /><span>Generate 4 images per day</span></div>
                <div className="flex items-start gap-3"><Check className="w-5 h-5 text-amber shrink-0" /><span>Audio input and output</span></div>
                <div className="flex items-start gap-3 text-ink-ghost"><Check className="w-5 h-5 text-edge shrink-0" /><span>No video generation</span></div>
                <div className="flex items-start gap-3"><Zap className="w-5 h-5 text-amber shrink-0" /><span>Model: <strong>Saarvam flash 3.0</strong></span></div>
              </div>
              <button 
                onClick={() => handleUpgrade('pro')}
                disabled={currentPlan === 'pro' || updating}
                className="relative z-40 w-full py-3 rounded-xl font-semibold bg-amber text-ink hover:bg-amber/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentPlan === 'pro' ? 'Active' : 'Upgrade to Pro'}
              </button>
            </div>
          </HighlighterItem>

          {/* Max Plan */}
          <HighlighterItem className="rounded-3xl h-full w-full">
            <div className={`h-full bg-paper-warm rounded-[23px] border ${currentPlan === 'max' ? 'border-teal ring-2 ring-teal/20' : 'border-transparent'} p-8 flex flex-col relative transition-all duration-300`}>
              <Particles
                className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-1000 ease-in-out group-hover/item:opacity-100"
                quantity={150}
                color={"#0ea5e9"}
                vy={-0.2}
              />
              {currentPlan === 'max' && <div className="absolute top-4 right-4 bg-teal text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full z-30">Current</div>}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-teal" />
                  <h2 className="text-2xl font-bold text-ink">Max</h2>
                </div>
                <div className="text-3xl text-ink flex items-baseline">
                  <span className="font-[Poppins] font-bold">₹</span>
                  <span className="font-[Poppins] font-bold inline-block min-w-[2.5ch] text-left">
                    <AnimatedNumber value={isAnnual ? 499 : 599} />
                  </span>
                  <span className="text-sm font-normal text-ink-muted ml-0.5">/mo</span>
                </div>
                <div className="text-xs text-ink-muted mt-1">{isAnnual ? 'Billed annually' : 'Billed monthly'}</div>
              </div>
              <div className="space-y-4 mb-8 flex-1 text-sm text-ink-soft">
                <div className="flex items-start gap-3"><Check className="w-5 h-5 text-teal shrink-0" /><span><strong>Unlimited</strong> prompts per day</span></div>
                <div className="flex items-start gap-3"><Check className="w-5 h-5 text-teal shrink-0" /><span>Generate 50 images per day</span></div>
                <div className="flex items-start gap-3"><Check className="w-5 h-5 text-teal shrink-0" /><span>Audio input and output</span></div>
                <div className="flex items-start gap-3"><Check className="w-5 h-5 text-teal shrink-0" /><span>Generate 4 videos</span></div>
                <div className="flex items-start gap-3"><Zap className="w-5 h-5 text-teal shrink-0" /><span>Model: <strong>Saarvam pro 3.5</strong></span></div>
              </div>
              <button 
                onClick={() => handleUpgrade('max')}
                disabled={currentPlan === 'max' || updating}
                className="relative z-40 w-full py-3 rounded-xl font-semibold bg-ink text-paper hover:bg-ink-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentPlan === 'max' ? 'Active' : 'Upgrade to Max'}
              </button>
            </div>
          </HighlighterItem>

        </HighlightGroup>
      </main>
    </div>
  )
}
