'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'

export default function EmployeePerformancePage() {
  const { employees, loans, customers, emis } = useStore()

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const data = useMemo(() => employees.map(emp => {
    const empLoans = loans.filter(l => l.employeeId === emp.id)
    const disbursed = empLoans.filter(l => l.status === 'disbursed')
    const totalDisbursed = disbursed.reduce((s, l) => s + l.amount, 0)
    const empLoanIds = empLoans.map(l => l.id)
    const collected = emis.filter(e => empLoanIds.includes(e.loanId) && (e.status === 'paid' || e.status === 'paid_late')).reduce((s, e) => s + (e.paidAmount ?? 0), 0)
    const overdueCount = emis.filter(e => empLoanIds.includes(e.loanId) && e.status === 'overdue').length
    const customersAdded = customers.filter(c => c.employeeId === emp.id).length
    return { emp, loans: empLoans.length, disbursedCount: disbursed.length, totalDisbursed, collected, overdueCount, customersAdded }
  }), [employees, loans, customers, emis])

  return (
    <>
      <PageHeader title="Employee Performance Report" />
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                {['Employee', 'Role', 'Customers Added', 'Total Loans', 'Disbursed', 'Total Disbursed', 'EMI Collected', 'Overdue EMIs'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={d.emp.id} className={`border-b border-slate-100 dark:border-slate-700 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{d.emp.name}</div>
                    <div className="text-xs text-slate-400">{d.emp.code}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.emp.role}</td>
                  <td className="px-4 py-3 text-center font-semibold text-purple-600 dark:text-purple-400">{d.customersAdded}</td>
                  <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">{d.loans}</td>
                  <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-semibold">{d.disbursedCount}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{fmt(d.totalDisbursed)}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">{fmt(d.collected)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.overdueCount > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'}`}>
                      {d.overdueCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
