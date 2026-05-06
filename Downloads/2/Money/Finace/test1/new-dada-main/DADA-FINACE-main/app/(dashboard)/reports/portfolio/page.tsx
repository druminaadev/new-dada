'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select } from '@/components/ui/Select'

export default function LoanPortfolioPage() {
  const { loans, customers, loanTypes, branches, emis } = useStore()
  const [filterBranch, setFilterBranch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() => loans.filter(l => {
    const c = customers.find(x => x.id === l.customerId)
    if (filterBranch && c?.branchId !== Number(filterBranch)) return false
    if (filterType && l.loanTypeId !== Number(filterType)) return false
    if (filterStatus && l.status !== filterStatus) return false
    return true
  }), [loans, customers, filterBranch, filterType, filterStatus])

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const getOutstanding = (loanId: number) => {
    const loanEmis = emis.filter(e => e.loanId === loanId && e.status !== 'paid' && e.status !== 'paid_late')
    return loanEmis.reduce((s, e) => s + e.emiAmount, 0)
  }

  return (
    <>
      <PageHeader title="Loan Portfolio Report" />
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-wrap gap-3">
          <Select label="Branch" placeholder="All Branches" options={branches.map(b => ({ value: b.id, label: b.name }))}
            value={filterBranch} onChange={e => setFilterBranch(e.target.value)} />
          <Select label="Loan Type" placeholder="All Types" options={loanTypes.map(t => ({ value: t.id, label: t.name }))}
            value={filterType} onChange={e => setFilterType(e.target.value)} />
          <Select label="Status" placeholder="All Status" options={['pending', 'approved', 'disbursed'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Loans', value: filtered.length },
            { label: 'Total Amount', value: fmt(filtered.reduce((s, l) => s + l.amount, 0)) },
            { label: 'Active (Disbursed)', value: filtered.filter(l => l.status === 'disbursed').length },
            { label: 'Pending Approval', value: filtered.filter(l => l.status === 'pending').length },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  {['Loan No', 'Customer', 'Type', 'Amount', 'Outstanding', 'Installments', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => {
                  const c = customers.find(x => x.id === l.customerId)
                  const lt = loanTypes.find(x => x.id === l.loanTypeId)
                  const outstanding = getOutstanding(l.id)
                  return (
                    <tr key={l.id} className={`border-b border-slate-100 dark:border-slate-700 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                      <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">{l.loanNo}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{c?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{lt?.name ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{fmt(l.amount)}</td>
                      <td className="px-4 py-3 text-orange-600 dark:text-orange-400">{outstanding > 0 ? fmt(outstanding) : '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{l.installments}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.status === 'disbursed' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : l.status === 'approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
