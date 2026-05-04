'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ToastContainer } from '@/components/ui/Toast'
import { Eye, EyeOff, Lock, Sun, Moon, TrendingUp, Shield, Zap } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const { showToast } = useUIStore()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const ok = login(username, password)
    setLoading(false)
    if (ok) { showToast('Login successful! Welcome back.', 'success'); router.push('/dashboard') }
    else showToast('Invalid username or password', 'error')
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <ToastContainer />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
            D
          </div>
          <div>
            <div className="text-base font-bold text-white drop-shadow">Dada Finance</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>Loan Management System</div>
          </div>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl cursor-pointer transition-colors"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="flex-1 flex min-h-screen">

        {/* Left — Branding panel */}
        <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-center px-16 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)' }}>

          {/* Decorative blobs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: '#fff' }} />
          <div className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: '#fff' }} />
          <div className="absolute top-1/3 right-10 w-24 h-24 rounded-full opacity-10" style={{ background: '#fff' }} />

          {/* Curved right edge */}
          <svg className="absolute right-0 top-0 h-full w-20" viewBox="0 0 80 800" preserveAspectRatio="none"
            style={{ color: 'var(--bg)' }}>
            <path d="M80,0 C40,200 40,600 80,800 L80,0 Z" fill="currentColor" />
          </svg>

          <div className="relative z-10 max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
              <span className="text-white text-xs font-medium">Trusted by 500+ businesses</span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Streamline Your<br />Loan Management
            </h1>
            <p className="text-sm mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Manage loans, customers, and employees efficiently with our comprehensive platform.
            </p>

            <div className="space-y-5">
              {[
                { icon: TrendingUp, title: 'Real-time Analytics',  desc: 'Track loan performance and customer insights instantly' },
                { icon: Shield,     title: 'Secure & Compliant',   desc: 'Bank-grade security with full audit trails' },
                { icon: Zap,        title: 'Lightning Fast',       desc: 'Process applications and approvals in seconds' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <f.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-0.5">{f.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Login form */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-8"
          style={{ background: 'var(--bg)' }}>

          {/* Subtle bg blob */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"
            style={{ background: 'var(--accent-tint)' }} />

          <div className="w-full max-w-sm relative z-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome Back 👋</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to access your dashboard</p>
            </div>

            {/* Card */}
            <div className="rounded-2xl shadow-sm p-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-tint)' }}>
                  <Lock size={15} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Sign In</h3>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Password <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="w-full h-10 px-3 pr-10 text-sm rounded-lg outline-none transition-colors"
                      style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-tint)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ color: 'var(--text-secondary)' }}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full mt-1" size="lg">
                  Sign In
                </Button>
              </form>

              {/* Demo credentials */}
              <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold mb-2.5" style={{ color: 'var(--text-primary)' }}>Demo Credentials</p>
                <div className="space-y-2 text-xs">
                  {[
                    { role: 'Admin',    cred: 'admin / admin123' },
                    { role: 'Employee', cred: 'employee / emp123' },
                    { role: 'Approver', cred: 'approver / apr123' },
                  ].map(c => (
                    <div key={c.role} className="flex items-center justify-between">
                      <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{c.role}</span>
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg"
                        style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                        {c.cred}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>
              Copyright © 2025 Dada Finance Corporation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
