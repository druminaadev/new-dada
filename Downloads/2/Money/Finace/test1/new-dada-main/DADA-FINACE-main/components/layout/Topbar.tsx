'use client'
import { useState, useRef, useEffect } from 'react'
import { Menu, LogOut, User, Bell, CheckCheck, Trash2, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

interface TopbarProps { onMenuToggle: () => void }

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuthStore()
  const { notifications, markAllRead, markOneRead, clearAll, showToast } = useUIStore()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    showToast('Logged out successfully', 'info')
    router.push('/login')
  }

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shrink-0 z-30 relative">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer lg:hidden text-slate-600 dark:text-slate-300">
          <Menu size={18} />
        </button>
        <div className="hidden lg:block text-sm font-semibold text-slate-800 dark:text-slate-200">
          Dada Finance Corporation — Loan Management System
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(p => !p)}
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-[999]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notifications</span>
                  {unread > 0 && (
                    <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-semibold">
                      {unread} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      onClick={() => { markAllRead(); showToast('All marked as read', 'success') }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => { clearAll(); showToast('Notifications cleared', 'info') }}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Bell size={28} className="mb-2 opacity-20" />
                    <span className="text-xs">No notifications</span>
                  </div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-start gap-3 ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-semibold truncate ${!n.read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">{n.time}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

        <div className="flex items-center gap-2 text-sm text-slate-600 px-1">
          <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
            <User size={14} className="text-blue-800 dark:text-blue-400" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{user?.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors cursor-pointer"
        >
          <LogOut size={13} /> Logout
        </button>
      </div>
    </header>
  )
}
