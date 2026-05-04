'use client'
import { useRouter } from 'next/navigation'
import { CreditCard, Clock, CheckCircle, Banknote, Users, UserCircle, TrendingUp, Plus } from 'lucide-react'
import { useStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'

export default function Dashboard() {
  const { loans, customers, employees } = useStore()
  const router = useRouter()

  const counts = {
    total: loans.length,
    pending: loans.filter(l => l.status === 'pending').length,
    approved: loans.filter(l => l.status === 'approved').length,
    disbursed: loans.filter(l => l.status === 'disbursed').length,
  }
  const totalDisbursed = loans.filter(l => l.status === 'disbursed').reduce((s, l) => s + l.amount, 0)
  const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const stats = [
    { label: 'Total Loans', value: counts.total, icon: CreditCard, bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    { label: 'Pending', value: counts.pending, icon: Clock, bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    { label: 'Approved', value: counts.approved, icon: CheckCircle, bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
    { label: 'Disbursed', value: counts.disbursed, icon: Banknote, bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    { label: 'Customers', value: customers.length, icon: UserCircle, bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
    { label: 'Employees', value: employees.length, icon: Users, bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400' },
    { label: 'Total Disbursed', value: formatINR(totalDisbursed), icon: TrendingUp, bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-400' },
  ]

  const recentLoans = [...loans].sort((a, b) => b.id - a.id).slice(0, 8)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Welcome back! Here&apos;s your loan overview.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => router.push('/customers/add')}><Plus size={13} /> Add Customer</Button>
          <Button size="sm" onClick={() => router.push('/loans/add')}><Plus size={13} /> Add Loan</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.text} />
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{s.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Loans</h2>
          <Button size="sm" variant="ghost" onClick={() => router.push('/loans/list')}>View All →</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                {['Loan ID', 'Customer', 'Employee', 'Amount', 'Installments', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLoans.map((loan, i) => {
                const customer = customers.find(c => c.id === loan.customerId)
                const employee = employees.find(e => e.id === loan.employeeId)
                return (
                  <tr key={loan.id} className={`border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                    <td className="px-4 py-3 font-medium text-blue-700 dark:text-blue-400">{loan.loanNo}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{customer?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{employee?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{formatINR(loan.amount)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{loan.installments}</td>
                    <td className="px-4 py-3"><Badge status={loan.status} /></td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{format(new Date(loan.loanDate), 'dd/MM/yyyy')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
