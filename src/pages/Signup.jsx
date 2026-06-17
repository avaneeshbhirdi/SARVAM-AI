import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check, ArrowRight, Sparkles, Brain, Layers } from 'lucide-react'
import { supabase } from '../lib/supabase'
import logoSvg from '../assets/logo.svg'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
]

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    })

    setIsLoading(false)

    if (error) {
      setErrorMsg(error.message)
    } else {
      navigate('/')
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) setErrorMsg(error.message)
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password))

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand showcase */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0D0D0D 0%, #1a1a1a 50%, #0a1a2a 100%)' }}>
        {/* Decorative curved shapes */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #0EA5A0, transparent)' }} />
        <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #E8450E, transparent)' }} />
        <div className="absolute top-1/4 right-1/3 w-72 h-72 rounded-[3rem] -rotate-12 border border-white/[0.04]" />
        <div className="absolute bottom-1/3 left-1/4 w-56 h-56 rounded-[2.5rem] rotate-6 border border-white/[0.03]" />
        
        {/* Dot pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img src={logoSvg} alt="Sarvam AI" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-semibold tracking-[-0.03em] text-white">
              sarvam<span style={{ color: '#0EA5A0' }}>.ai</span>
            </span>
          </Link>

          {/* Hero text */}
          <div className="space-y-6">
            <h2 className="text-4xl font-display text-white leading-tight tracking-[-0.02em]">
              Begin your<br />
              <span className="accent-gradient-text animate-gradient-flow" style={{ backgroundSize: '200% 200%' }}>journey here.</span>
            </h2>
            <p className="text-white/50 text-[15px] leading-relaxed max-w-sm">
              Join thousands of thinkers, creators, and builders who use Sarvam to transform ideas into reality.
            </p>

            {/* Stats or features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { icon: Sparkles, value: '10M+', label: 'Queries served' },
                { icon: Brain, value: '99.9%', label: 'Uptime' },
                { icon: Layers, value: '50+', label: 'AI models' },
              ].map(({ icon: Icon, value, label }, i) => (
                <div key={i} className="animate-fade-up" style={{ opacity: 0, animationDelay: `${0.3 + i * 0.1}s` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Icon className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="text-white text-lg font-semibold tracking-tight">{value}</div>
                  <div className="text-white/30 text-[11px]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/20 text-xs">
            © 2024 Sarvam AI. Intelligence, reimagined.
          </p>
        </div>
      </div>

      {/* Right Panel — Signup Form */}
      <div className="flex-1 bg-paper flex flex-col relative">
        <div className="fixed inset-0 dot-matrix pointer-events-none lg:left-[45%]" />
        
        {/* Mobile logo */}
        <div className="lg:hidden p-5">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img src={logoSvg} alt="Sarvam AI" className="w-8 h-8 rounded-lg" />
            <span className="text-[17px] font-semibold tracking-[-0.03em] text-ink">
              sarvam<span className="text-coral">.ai</span>
            </span>
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-8 relative z-10">
          <div className="w-full max-w-[420px]">
            {/* Card container */}
            <div className="bg-card rounded-3xl border border-edge/80 shadow-xl shadow-ink/[0.03] p-8 sm:p-10">
              {/* Header */}
              <div className="mb-6 animate-fade-up" style={{ opacity: 0, animationDelay: '0.05s' }}>
                <h1 className="text-2xl font-display tracking-[-0.03em] text-ink mb-1.5">
                  Create your account
                </h1>
                <p className="text-ink-muted text-sm">
                  Start weaving threads of intelligence
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm animate-fade-up">
                  {errorMsg}
                </div>
              )}

              {/* Google button first */}
              <button
                id="google-signup-btn"
                onClick={handleGoogleSignup}
                className="w-full py-3 rounded-2xl bg-paper border border-edge text-ink text-sm font-medium hover:border-edge-strong hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 active:scale-[0.97] animate-fade-up btn-press"
                style={{ opacity: 0, animationDelay: '0.1s' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-5 animate-fade-up" style={{ opacity: 0, animationDelay: '0.15s' }}>
                <div className="flex-1 h-px bg-edge" />
                <span className="text-[11px] text-ink-ghost uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-edge" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 animate-fade-up" style={{ opacity: 0, animationDelay: '0.2s' }}>
                <div>
                  <label htmlFor="signup-name" className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1.5">
                    Full name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-paper border border-edge text-ink text-sm placeholder-ink-ghost focus:outline-none input-focus-ring transition-all duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1.5">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-paper border border-edge text-ink text-sm placeholder-ink-ghost focus:outline-none input-focus-ring transition-all duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      className="w-full px-4 py-2.5 pr-12 rounded-xl bg-paper border border-edge text-ink text-sm placeholder-ink-ghost focus:outline-none input-focus-ring transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-muted transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength */}
                  {password.length > 0 && (
                    <div className="mt-2.5 space-y-1">
                      {PASSWORD_RULES.map((rule, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-300 ${
                            rule.test(password) ? 'bg-teal text-white' : 'bg-paper-warm border border-edge'
                          }`}>
                            {rule.test(password) && <Check className="w-2 h-2" />}
                          </div>
                          <span className={`text-[11px] transition-colors ${
                            rule.test(password) ? 'text-teal' : 'text-ink-ghost'
                          }`}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Terms */}
                <label htmlFor="signup-terms" className="flex items-start gap-2.5 cursor-pointer py-1">
                  <div className="relative mt-0.5">
                    <input
                      id="signup-terms"
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                      agreed ? 'bg-ink border-ink' : 'bg-paper border-edge hover:border-edge-strong'
                    }`} style={{ width: '18px', height: '18px' }}>
                      {agreed && <Check className="w-3 h-3 text-paper" />}
                    </div>
                  </div>
                  <span className="text-[12px] text-ink-muted leading-relaxed">
                    I agree to the{' '}
                    <span className="text-ink font-medium hover:underline cursor-pointer">Terms</span>
                    {' '}and{' '}
                    <span className="text-ink font-medium hover:underline cursor-pointer">Privacy Policy</span>
                  </span>
                </label>

                <button
                  id="signup-submit-btn"
                  type="submit"
                  disabled={isLoading || !agreed || !allRulesPassed}
                  className="w-full py-3 rounded-xl accent-gradient text-white text-sm font-medium hover:opacity-90 transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] shadow-md shadow-coral/10 flex items-center justify-center gap-2 btn-press"
                >
                  {isLoading ? 'Creating account...' : (
                    <>Create account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>

            {/* Switch to login */}
            <p className="text-center text-ink-muted text-sm mt-6 animate-fade-up" style={{ opacity: 0, animationDelay: '0.3s' }}>
              Already have an account?{' '}
              <Link to="/login" className="text-coral font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
