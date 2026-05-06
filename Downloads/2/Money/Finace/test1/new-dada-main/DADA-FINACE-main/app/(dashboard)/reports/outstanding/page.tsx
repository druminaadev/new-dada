'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { format, parseISO } from 'date-fns'

export default function OutstandingDuesPage() {
  const { emis, loans, customers, employees } = useStore()
  const today = new Date().toISOString().split('T')[0]

  const overdueEmis = useMemo(() => emis.filter(e => e.status === 'overdue'), [emis])

  const grouped = useMemo(() => {
    const map: Record<number, { customer: typeof customers[0] | undefined; loan: typeof loans[0] | undefined; emis: typeof overdueEmis; totalOverdue: number; daysOverdue: number }> = {}
    overdueEmis.forEach(e => {
      const loan = loans.find(l => l.id === e.loanId)
      if (!loan) return
      if (!map[loan.customerId]) {
        map[loan.customerId] = { customer: customers.find(c => c.id === loan.customerId), loan, emis: [], totalOverdue: 0, daysOverdue: 0 }
      }
      map[loan.customerId].emis.push(e)
      map[loan.customerId].totalOverdue += e.emiAmount
      const days = Math.floor((new Date(today).getTime() - new Date(e.dueDate).getTime()) / 86400000)
      map[loan.customerId].daysOverdue = Math.max(map[loan.customerId].daysOverdue, days)
    })
    return Object.values(map)
  }, [overdueEmis, loans, customers, today])

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <>
      <PageHeader title="Outstanding Dues Report" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Overdue Accounts</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{grouped.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Overdue EMIs</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{overdueEmis.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Overdue Amount</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{fmt(grouped.reduce((s, g) => s + g.totalOverdue, 0))}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {grouped.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">No overdue accounts 🎉</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    {['Customer', 'Mobile', 'Loan No', 'Overdue EMIs', 'Overdue Amount', 'Days Overdue', 'Oldest Due Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped.sort((a, b) => b.daysOverdue - a.daysOverdue).map((g, i) => (
                    <tr key={i} className={`border-b border-slate-100 dark:border-slate-700 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{g.customer?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{g.customer?.mobile ?? '—'}</td>
                      <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-medium">{g.loan?.loanNo ?? '—'}</td>
                      <td className="px-4 py-3 text-center font-semibold text-orange-600 dark:text-orange-400">{g.emis.length}</td>
                      <td className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">{fmt(g.totalOverdue)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${g.daysOverdue > 30 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'}`}>
                          {g.daysOverdue} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {format(parseISO(g.emis.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0].dueDate), 'dd/MM/yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
