'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Database, Users, UserCircle, CreditCard,
  ChevronDown, MapPin, Building2, Landmark,
  Tag, UserPlus, List, UserCheck, FilePlus, FileText,
  CheckSquare, CheckCircle, Banknote, X
} from 'lucide-react'

interface NavChild { label: string; path: string; icon: React.ElementType }
interface NavItem  { label: string; icon: React.ElementType; path?: string; children?: NavChild[] }

const NAV: NavItem[] = [
  { label: 'Master', icon: Database, children: [
    { label: 'State',               path: '/master/states',     icon: MapPin },
    { label: 'City',                path: '/master/cities',     icon: Building2 },
    { label: 'Area',                path: '/master/areas',      icon: MapPin },
    { label: 'Branch',              path: '/master/branches',   icon: Landmark },
    { label: 'Loan Type',           path: '/master/loan-types', icon: Tag },
    { label: 'Bank',                path: '/master/banks',      icon: Landmark },
  ]},
  { label: 'Employee', icon: Users, children: [
    { label: 'Add Employee',        path: '/employees/add',     icon: UserPlus },
    { label: 'Employee List',       path: '/employees/list',    icon: List },
  ]},
  { label: 'Customer', icon: UserCircle, children: [
    { label: 'Add Customer',        path: '/customers/add',     icon: UserPlus },
    { label: 'Customer List',       path: '/customers/list',    icon: UserCheck },
  ]},
  { label: 'Loan', icon: CreditCard, children: [
    { label: 'Add Loan',            path: '/loans/add',         icon: FilePlus },
    { label: 'Loan List',           path: '/loans/list',        icon: FileText },
    { label: 'Approved Loan List',  path: '/loans/approved',    icon: CheckCircle },
    { label: 'Disbursed Loan List', path: '/loans/disbursed',   icon: Banknote },
    { label: 'Loan Approval',       path: '/loans/approval',    icon: CheckSquare },
  ]},
]

interface SidebarProps { open: boolean; onClose?: () => void }

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>(['Master', 'Employee', 'Customer', 'Loan'])

  const toggle = (label: string) =>
    setExpanded(p => p.includes(label) ? p.filter(x => x !== label) : [...p, label])

  const isChildActive = (item: NavItem) =>
    item.children?.some(c => pathname === c.path || pathname.startsWith(c.path + '/'))

  return (
    <>
      {open && onClose && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
              D
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight tracking-wide"
                style={{ color: 'var(--text-primary)' }}>Dada Finance</div>
              <div className="text-[11px] mt-0.5"
                style={{ color: 'var(--text-secondary)' }}>Loan Management</div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg cursor-pointer transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--hover)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' }}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dashboard link */}
        <div className="px-4 pt-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--text-secondary)' }}>
            Dashboard
          </p>
          <NavLink href="/" active={pathname === '/'}>
            <LayoutDashboard size={15} style={{ color: pathname === '/' ? 'var(--accent)' : 'var(--text-secondary)', flexShrink: 0 }} />
            <span className="text-sm font-medium">Overview</span>
          </NavLink>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-6" style={{ scrollbarWidth: 'none' }}>
          {NAV.map((item, idx) => {
            const isOpen = expanded.includes(item.label)
            const active = isChildActive(item)

            return (
              <div key={item.label}>
                {idx > 0 && (
                  <div className="mb-4" style={{ borderTop: '1px solid var(--border)' }} />
                )}

                {/* Section heading + toggle */}
                <button onClick={() => toggle(item.label)}
                  className="w-full flex items-center justify-between mb-1 cursor-pointer group">
                  <span className="text-[10px] font-semibold uppercase tracking-widest transition-colors"
                    style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {item.label}
                  </span>
                  <ChevronDown size={12} style={{
                    color: 'var(--text-secondary)',
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }} />
                </button>

                {/* Children */}
                <div className="overflow-hidden transition-all duration-200 ease-in-out space-y-0.5"
                  style={{ maxHeight: isOpen ? '400px' : '0', opacity: isOpen ? 1 : 0 }}>
                  {item.children!.map(child => {
                    const childActive = pathname === child.path || pathname.startsWith(child.path + '/')
                    return (
                      <NavLink key={child.path} href={child.path} active={childActive}>
                        <child.icon size={14} style={{ color: childActive ? 'var(--accent)' : 'var(--text-secondary)', flexShrink: 0 }} />
                        <span className="text-sm font-medium leading-none">{child.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150"
      style={{
        color:      active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-tint)'  : 'transparent',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--hover)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
      {children}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />}
    </Link>
  )
}
