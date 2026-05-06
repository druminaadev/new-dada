'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function BranchPerformancePage() {
  const { branches, loans, customers, emis } = useStore()

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const data = useMemo(() => branches.map(b => {
    const branchCustomerIds = customers.filter(c => c.branchId === b.id).map(c => c.id)
    const branchLoans = loans.filter(l => branchCustomerIds.includes(l.customerId))
    const disbursed = branchLoans.filter(l => l.status === 'disbursed').reduce((s, l) => s + l.amount, 0)
    const branchLoanIds = branchLoans.map(l => l.id)
    const collected = emis.filter(e => branchLoanIds.includes(e.loanId) && (e.status === 'paid' || e.status === 'paid_late')).reduce((s, e) => s + (e.paidAmount ?? 0), 0)
    const overdue = emis.filter(e => branchLoanIds.includes(e.loanId) && e.status === 'overdue').length
    return { name: b.name.replace(' Branch', '').replace(' Main', ''), disbursed, collected, overdue, loans: branchLoans.length }
  }), [branches, loans, customers, emis])

  const tooltipStyle = {
    contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' },
  }

  return (
    <>
      <PageHeader title="Branch Performance Report" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.map(b => (
            <div key={b.name} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{b.name}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Loans</span><span className="font-medium text-slate-700 dark:text-slate-300">{b.loans}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Disbursed</span><span className="font-medium text-green-600 dark:text-green-400">{fmt(b.disbursed)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Collected</span><span className="font-medium text-blue-600 dark:text-blue-400">{fmt(b.collected)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Overdue EMIs</span><span className="font-medium text-red-600 dark:text-red-400">{b.overdue}</span></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Disbursed vs Collected by Branch</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v, name) => [fmt(Number(v)), name]} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              <Bar dataKey="disbursed" name="Disbursed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
