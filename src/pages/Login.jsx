import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate login — replace with real auth
    setTimeout(() => setIsLoading(false), 1500)
  }

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
              Welcome back.
            </h1>
            <p className="text-ink-muted text-[15px]">
              Log in to continue your conversation threads.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up" style={{ opacity: 0, animationDelay: '0.15s' }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-2">
                Email
              </label>
              <input
                id="login-email"
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  Password
                </label>
                <button type="button" className="text-[12px] text-coral hover:text-coral/80 font-medium transition-colors cursor-pointer">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-ink text-paper text-[15px] font-medium hover:bg-ink-soft transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
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
            id="google-login-btn"
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

          {/* Switch to signup */}
          <p className="text-center text-ink-muted text-sm mt-8 animate-fade-up" style={{ opacity: 0, animationDelay: '0.3s' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-coral font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
