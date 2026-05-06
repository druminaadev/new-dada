'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Footer } from '@/components/layout/Footer'
import { ToastContainer } from '@/components/ui/Toast'
import { Chatbot } from '@/components/ui/Chatbot'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace('/login')
  }, [mounted, isAuthenticated, router])

  if (!mounted || !isAuthenticated) return null

  return (
    <>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface)' }}>
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(p => !p)}
        />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar onMenuToggle={() => setSidebarOpen(p => !p)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
          <Footer />
        </div>
      </div>
      <ToastContainer />
      <Chatbot />
    </>
  )
}
