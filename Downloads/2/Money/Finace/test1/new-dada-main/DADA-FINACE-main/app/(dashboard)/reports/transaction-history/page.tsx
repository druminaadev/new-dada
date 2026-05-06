'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { format, parseISO } from 'date-fns'

export default function TransactionHistoryPage() {
  const { emis, loans, customers, employees } = useStore()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const collected = useMemo(() => {
    return emis.filter(e => (e.status === 'paid' || e.status === 'paid_late') && e.paidDate)
      .filter(e => {
        if (from && e.paidDate! < from) return false
        if (to && e.paidDate! > to) return false
        return true
      })
      .sort((a, b) => (b.paidDate ?? '').localeCompare(a.paidDate ?? ''))
  }, [emis, from, to])

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <>
      <PageHeader title="Transaction History" />
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-wrap gap-3 items-end">
          <Input label="From Date" type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <Input label="To Date" type="date" value={to} onChange={e => setTo(e.target.value)} />
          <div className="flex items-end pb-0.5">
            <div className="text-sm text-slate-500 dark:text-slate-400">{collected.length} transactions | Total: <span className="font-semibold text-green-600 dark:text-green-400">{fmt(collected.reduce((s, e) => s + (e.paidAmount ?? 0), 0))}</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {collected.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">No transactions found for selected range</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    {['Date', 'Loan No', 'Customer', 'EMI #', 'Amount', 'Mode', 'Collected By', 'Status'].map(h => (
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
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.paidDate ? format(parseISO(e.paidDate), 'dd/MM/yyyy') : '—'}</td>
                        <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">{loan?.loanNo ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{customer?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.instNo}</td>
                        <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">{fmt(e.paidAmount ?? 0)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.paymentMode ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{emp?.name ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'}`}>
                            {e.status === 'paid' ? 'On Time' : 'Late'}
                          </span>
                        </td>
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
