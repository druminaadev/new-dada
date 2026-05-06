'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import React from 'react'

interface PageHeaderProps {
  title: string
  action?: { label: string; onClick: () => void; icon?: React.ReactNode }
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Dashboard', master: 'Master', states: 'States', cities: 'Cities',
  areas: 'Areas', branches: 'Branches', 'loan-types': 'Loan Types', banks: 'Banks',
  employees: 'Employees', add: 'Add', list: 'List', customers: 'Customers',
  details: 'Details', loans: 'Loans', approval: 'Approval',
  approved: 'Approved', disbursed: 'Disbursed',
}

export function PageHeader({ title, action }: PageHeaderProps) {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean)
  const crumbs = [
    { label: 'Dashboard', path: '/' },
    ...parts.map((p, i) => ({ label: ROUTE_LABELS[p] ?? p, path: '/' + parts.slice(0, i + 1).join('/') }))
  ]

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        <nav className="flex items-center gap-1 mt-1">
          {crumbs.map((c, i) => (
            <span key={c.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-slate-400 dark:text-slate-500" />}
              {i === crumbs.length - 1
                ? <span className="text-xs text-slate-500 dark:text-slate-400">{c.label}</span>
                : <Link href={c.path} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{c.label}</Link>}
            </span>
          ))}
        </nav>
      </div>
      {action && <Button onClick={action.onClick} size="sm">{action.icon}{action.label}</Button>}
    </div>
  )
}
