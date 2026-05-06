'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { format, parseISO } from 'date-fns'

export default function DailyCollectionPage() {
  const { emis, loans, customers, employees, branches } = useStore()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const collected = useMemo(() => emis.filter(e => e.paidDate === date), [emis, date])

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const total = collected.reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const byCash = collected.filter(e => e.paymentMode === 'Cash').reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const byUPI = collected.filter(e => e.paymentMode === 'UPI').reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const byBank = collected.filter(e => e.paymentMode === 'Bank Transfer').reduce((s, e) => s + (e.paidAmount ?? 0), 0)

  const branchTotals = useMemo(() => {
    const map: Record<number, number> = {}
    collected.forEach(e => {
      const loan = loans.find(l => l.id === e.loanId)
      const customer = loan ? customers.find(c => c.id === loan.customerId) : null
      if (customer) map[customer.branchId] = (map[customer.branchId] ?? 0) + (e.paidAmount ?? 0)
    })
    return map
  }, [collected, loans, customers])

  return (
    <>
      <PageHeader title="Daily Collection Report" />
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-w-xs">
          <Input label="Select Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Collected', value: fmt(total), color: 'text-green-600 dark:text-green-400' },
            { label: 'Cash', value: fmt(byCash), color: 'text-blue-600 dark:text-blue-400' },
            { label: 'UPI', value: fmt(byUPI), color: 'text-purple-600 dark:text-purple-400' },
            { label: 'Bank Transfer', value: fmt(byBank), color: 'text-orange-600 dark:text-orange-400' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
              <div className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {branches.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Branch-wise Breakdown</h3>
            <div className="flex flex-wrap gap-3">
              {branches.map(b => (
                <div key={b.id} className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400">{b.name}</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{fmt(branchTotals[b.id] ?? 0)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Collection Details ({collected.length} entries)</h3>
          </div>
          {collected.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">No collections on {format(parseISO(date), 'dd MMM yyyy')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    {['Loan No', 'Customer', 'EMI #', 'Amount', 'Mode', 'Collected By'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {collected.map((e, i) => {
                    const loan = loans.find(l => l.id === e.loanId)
                    const customer = loan ? customers.find(c => c.id === loan.customerId) : null
                    const emp = employees.find(x => x.id === e.collectedBy)
                    return (
                      <tr key={e.id} className={`border-b border-slate-100 dark:border-slate-700 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                        <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">{loan?.loanNo ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{customer?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.instNo}</td>
                        <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">{fmt(e.paidAmount ?? 0)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.paymentMode}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{emp?.name ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
