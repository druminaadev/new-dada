'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, startOfMonth, parseISO } from 'date-fns'

export default function BusinessTrendPage() {
  const { loans, emis } = useStore()

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; disbursed: number; collected: number; interest: number; fileCharges: number }> = {}
    loans.forEach(l => {
      const key = format(startOfMonth(parseISO(l.loanDate)), 'MMM yy')
      if (!map[key]) map[key] = { month: key, disbursed: 0, collected: 0, interest: 0, fileCharges: 0 }
      map[key].disbursed += l.amount
      map[key].interest += l.interestAmount
      map[key].fileCharges += l.fileCharges + l.otherCharges
    })
    emis.filter(e => e.paidDate).forEach(e => {
      const key = format(startOfMonth(parseISO(e.paidDate!)), 'MMM yy')
      if (!map[key]) map[key] = { month: key, disbursed: 0, collected: 0, interest: 0, fileCharges: 0 }
      map[key].collected += e.paidAmount ?? 0
    })
    return Object.values(map).slice(-12)
  }, [loans, emis])

  const tooltipStyle = {
    contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' },
  }

  const totalInterest = loans.reduce((s, l) => s + l.interestAmount, 0)
  const totalCharges = loans.reduce((s, l) => s + l.fileCharges + l.otherCharges, 0)
  const totalCollected = emis.filter(e => e.status === 'paid' || e.status === 'paid_late').reduce((s, e) => s + (e.paidAmount ?? 0), 0)

  return (
    <>
      <PageHeader title="Business Trend Report" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Interest Income', value: fmt(totalInterest), color: 'text-green-600 dark:text-green-400' },
            { label: 'Total File/Other Charges', value: fmt(totalCharges), color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Total EMI Collected', value: fmt(totalCollected), color: 'text-purple-600 dark:text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
              <div className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Monthly Disbursement vs Collection</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="disbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v, name) => [fmt(Number(v)), name]} />
              <Area type="monotone" dataKey="disbursed" name="Disbursed" stroke="#3B82F6" strokeWidth={2} fill="url(#disbGrad)" />
              <Area type="monotone" dataKey="collected" name="Collected" stroke="#10B981" strokeWidth={2} fill="url(#collGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
