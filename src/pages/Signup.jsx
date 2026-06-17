import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

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
      // Success
      navigate('/')
    }
  }

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password))

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Dot matrix background */}
      <div className="fixed inset-0 dot-matrix pointer-events-none" />

      {/* Back link */}
      <div className="relative z-10 p-5 sm:p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>
      </div>

      {/* Form container */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 pb-16">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8 animate-fade-up" style={{ opacity: 0, animationDelay: '0.05s' }}>
            <h1 className="text-3xl font-display tracking-[-0.03em] text-ink mb-2">
              Start a new thread.
            </h1>
            <p className="text-ink-muted text-[15px]">
              Create your account and begin exploring.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm animate-fade-up">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up" style={{ opacity: 0, animationDelay: '0.15s' }}>
            {/* Name */}
            <div>
              <label htmlFor="signup-name" className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-2">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full px-4 py-3 rounded-xl bg-card border border-edge text-ink text-[15px] placeholder-ink-ghost focus:outline-none input-focus-ring transition-all duration-300"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-2">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-card border border-edge text-ink text-[15px] placeholder-ink-ghost focus:outline-none input-focus-ring transition-all duration-300"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-2">
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
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-card border border-edge text-ink text-[15px] placeholder-ink-ghost focus:outline-none input-focus-ring transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-muted transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {PASSWORD_RULES.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                        rule.test(password) ? 'bg-teal text-white' : 'bg-paper-warm border border-edge'
                      }`}>
                        {rule.test(password) && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className={`text-[12px] transition-colors ${
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
            <label htmlFor="signup-terms" className="flex items-start gap-3 cursor-pointer py-1">
              <div className="relative mt-0.5">
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
                  agreed ? 'bg-ink border-ink' : 'bg-card border-edge hover:border-edge-strong'
                }`}>
                  {agreed && <Check className="w-3 h-3 text-paper" />}
                </div>
              </div>
              <span className="text-[13px] text-ink-muted leading-relaxed">
                I agree to the{' '}
                <span className="text-ink font-medium hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-ink font-medium hover:underline cursor-pointer">Privacy Policy</span>
              </span>
            </label>

            {/* Submit */}
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading || !agreed || !allRulesPassed}
              className="w-full py-3 rounded-xl accent-gradient text-white text-[15px] font-medium hover:opacity-90 transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-md shadow-coral/10"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6 animate-fade-up" style={{ opacity: 0, animationDelay: '0.2s' }}>
            <div className="flex-1 h-px bg-edge" />
            <span className="text-[12px] text-ink-ghost uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-edge" />
          </div>

          {/* Google */}
          <button
            id="google-signup-btn"
            className="w-full py-3 rounded-xl bg-card border border-edge text-ink text-[15px] font-medium hover:border-edge-strong hover:shadow-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 active:scale-[0.98] animate-fade-up"
            style={{ opacity: 0, animationDelay: '0.25s' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Switch to login */}
          <p className="text-center text-ink-muted text-sm mt-8 animate-fade-up" style={{ opacity: 0, animationDelay: '0.3s' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-coral font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
