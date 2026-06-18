import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import logoSvg from '../assets/logo.svg'

const PASSWORD_RULES = [
  { label: '8+ characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase', test: (p) => /[A-Z]/.test(p) },
  { label: 'Number', test: (p) => /\d/.test(p) },
]

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const isSignup = mode === 'signup'
  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password))

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // Client-side validation
    if (!email || !isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address')
      return
    }
    if (!password) {
      setErrorMsg('Please enter a password')
      return
    }
    if (isSignup && !name.trim()) {
      setErrorMsg('Please enter your full name')
      return
    }
    if (isSignup && !allRulesPassed) {
      setErrorMsg('Password does not meet the requirements')
      return
    }

    setIsLoading(true)

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      navigate('/')
    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      })
      if (error) setErrorMsg(error.message)
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setErrorMsg('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center relative px-5 py-10">
      {/* Background */}
      <div className="fixed inset-0 dot-matrix pointer-events-none" />

      {/* Logo centered above card */}
      <div className="relative z-10 mb-8 flex flex-col items-center gap-2 animate-fade-up" style={{ opacity: 0, animationDelay: '0.05s' }}>
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src={logoSvg} alt="Sarvam AI" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-semibold tracking-[-0.03em] text-ink">
            sarvam<span style={{ color: '#D4690A' }}>.ai</span>
          </span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-[420px] animate-fade-up" style={{ opacity: 0, animationDelay: '0.1s' }}>
        <div className="bg-card rounded-3xl border border-edge/80 shadow-xl shadow-ink/[0.03] overflow-hidden">

          {/* Mode Toggle Tabs */}
          <div className="flex border-b border-edge">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all cursor-pointer relative ${!isSignup ? 'text-ink' : 'text-ink-muted hover:text-ink-soft'
                }`}
            >
              Sign In
              {!isSignup && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-brand-blue rounded-full" />}
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all cursor-pointer relative ${isSignup ? 'text-ink' : 'text-ink-muted hover:text-ink-soft'
                }`}
            >
              Sign Up
              {isSignup && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-brand-blue rounded-full" />}
            </button>
          </div>

          {/* Card Body */}
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl font-display tracking-[-0.03em] text-ink mb-1">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-ink-muted text-sm">
                {isSignup ? 'Start weaving threads of intelligence' : 'Pick up where your threads left off'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-sm">
                {errorMsg}
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full py-3 rounded-2xl bg-paper border border-edge text-ink text-sm font-medium hover:border-edge-strong hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 active:scale-[0.97]"
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
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-edge" />
              <span className="text-[11px] text-ink-ghost uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-edge" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              {/* Name — signup only */}
              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{ maxHeight: isSignup ? '80px' : '0', opacity: isSignup ? 1 : 0, marginBottom: isSignup ? undefined : '-14px' }}
              >
                <label htmlFor="auth-name" className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1.5">
                  Full name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  tabIndex={isSignup ? 0 : -1}
                  className="w-full px-4 py-2.5 rounded-xl bg-paper border border-edge text-ink text-sm placeholder-ink-ghost outline-none focus:border-brand-blue/40 focus:shadow-[0_0_0_3px_rgba(10, 67, 197,0.06)] transition-all duration-200"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="auth-email" className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-1.5">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-paper border border-edge text-ink text-sm placeholder-ink-ghost outline-none focus:border-brand-blue/40 focus:shadow-[0_0_0_3px_rgba(10, 67, 197,0.06)] transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="auth-password" className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    Password
                  </label>
                  {!isSignup && (
                    <button type="button" className="text-[11px] text-brand-blue hover:text-brand-blue/80 font-medium transition-colors cursor-pointer">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignup ? 'Create a strong password' : '••••••••'}
                    required
                    className="w-full px-4 py-2.5 pr-12 rounded-xl bg-paper border border-edge text-ink text-sm placeholder-ink-ghost outline-none focus:border-brand-blue/40 focus:shadow-[0_0_0_3px_rgba(10, 67, 197,0.06)] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-muted transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password rules */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-out"
                  style={{ maxHeight: isSignup && password.length > 0 ? '100px' : '0', opacity: isSignup && password.length > 0 ? 1 : 0 }}
                >
                  <div className="flex gap-3 mt-2.5">
                    {PASSWORD_RULES.map((rule, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all duration-200 ${rule.test(password) ? 'bg-green-600 text-white' : 'bg-paper-warm border border-edge'
                          }`}>
                          {rule.test(password) && <Check className="w-2 h-2" />}
                        </div>
                        <span className={`text-[10px] transition-colors ${rule.test(password) ? 'text-green-600' : 'text-ink-ghost'}`}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{ maxHeight: isSignup ? '50px' : '0', opacity: isSignup ? 1 : 0 }}
              >
                <label htmlFor="auth-terms" className="flex items-start gap-2.5 cursor-pointer py-1">
                  <div className="relative mt-0.5">
                    <input id="auth-terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
                    <div className={`rounded-md border-2 flex items-center justify-center transition-all duration-200 ${agreed ? 'bg-green-600 border-green-600' : 'bg-paper border-edge hover:border-edge-strong'
                      }`} style={{ width: '16px', height: '16px' }}>
                      {agreed && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                  </div>
                  <span className="text-[11px] text-ink-muted leading-relaxed">
                    I agree to the <span className="text-ink font-medium hover:underline cursor-pointer">Terms</span> & <span className="text-ink font-medium hover:underline cursor-pointer">Privacy Policy</span>
                  </span>
                </label>
              </div>

              {/* Submit — same brand-blue style for both modes */}
              <button
                type="submit"
                disabled={isLoading || (isSignup && (!agreed || !allRulesPassed))}
                className="w-full py-3 rounded-xl bg-ink text-paper text-sm font-medium hover:bg-ink-soft transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignup ? 'Create account' : 'Log in'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
