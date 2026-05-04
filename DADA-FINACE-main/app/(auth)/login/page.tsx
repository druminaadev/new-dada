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
    if (ok) {
      showToast('Login successful! Welcome back.', 'success')
      router.push('/dashboard')
    } else {
      showToast('Invalid username or password', 'error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <ToastContainer />
      
      {/* Header with theme toggle */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg bg-blue-600 dark:bg-blue-500">
            D
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-white">Dada Finance</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Loan Management System</div>
          </div>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="flex-1 flex">
        {/* Left Side - Image/Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 dark:from-blue-900 dark:via-slate-900 dark:to-slate-950 p-12 flex-col justify-center">
          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl font-bold text-white mb-4">
              Streamline Your Loan Management
            </h1>
            <p className="text-blue-100 dark:text-blue-200 text-lg mb-8">
              Manage loans, customers, and employees efficiently with our comprehensive platform.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Real-time Analytics</h3>
                  <p className="text-blue-100 dark:text-blue-200 text-sm">Track loan performance and customer insights instantly</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Secure & Compliant</h3>
                  <p className="text-blue-100 dark:text-blue-200 text-sm">Bank-grade security with full audit trails</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Lightning Fast</h3>
                  <p className="text-blue-100 dark:text-blue-200 text-sm">Process applications and approvals in seconds</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Sign in to access your dashboard</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
              <div className="flex items-center gap-2 mb-6">
                <Lock size={18} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Sign In</h3>
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
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full h-10 px-3 pr-10 text-sm border border-slate-300 dark:border-slate-600 rounded-md outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                  Sign In
                </Button>
              </form>

              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Demo Credentials:</p>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Admin:</span>
                    <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded">admin / admin123</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Employee:</span>
                    <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded">employee / emp123</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Approver:</span>
                    <span className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded">approver / apr123</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-6">
              Copyright © 2025 Dada Finance Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
