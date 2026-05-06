'use client'
import { useRouter } from 'next/navigation'
import { CreditCard, Clock, CheckCircle, Banknote, Users, UserCircle, TrendingUp, Plus } from 'lucide-react'
import { useStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { format, parseISO, startOfMonth } from 'date-fns'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const STAT_CFG = [
  { key: 'total',     label: 'Total Loans',     icon: CreditCard,  color: '#3B82F6' },
  { key: 'pending',   label: 'Pending',          icon: Clock,       color: '#F59E0B' },
  { key: 'approved',  label: 'Approved',         icon: CheckCircle, color: '#6366F1' },
  { key: 'disbursed', label: 'Disbursed',        icon: Banknote,    color: '#10B981' },
  { key: 'customers', label: 'Customers',        icon: UserCircle,  color: '#A855F7' },
  { key: 'employees', label: 'Employees',        icon: Users,       color: '#F43F5E' },
  { key: 'amount',    label: 'Total Disbursed',  icon: TrendingUp,  color: '#14B8A6' },
]

export default function Dashboard() {
  const { loans, customers, employees } = useStore()
  const router = useRouter()

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const totalDisbursed = loans.filter(l => l.status === 'disbursed').reduce((s, l) => s + l.amount, 0)

  const values: Record<string, string | number> = {
    total:     loans.length,
    pending:   loans.filter(l => l.status === 'pending').length,
    approved:  loans.filter(l => l.status === 'approved').length,
    disbursed: loans.filter(l => l.status === 'disbursed').length,
    customers: customers.length,
    employees: employees.length,
    amount:    formatINR(totalDisbursed),
  }

  // ── Chart 1: Monthly loan count trend ──────────────────────
  const monthlyMap: Record<string, { month: string; loans: number; amount: number }> = {}
  loans.forEach(l => {
    const key = format(startOfMonth(parseISO(l.loanDate)), 'MMM yy')
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, loans: 0, amount: 0 }
    monthlyMap[key].loans++
    monthlyMap[key].amount += l.amount
  })
  const trendData = Object.values(monthlyMap).slice(-6)

  // ── Chart 2: Status donut ───────────────────────────────────
  const donutData = [
    { name: 'Pending',   value: loans.filter(l => l.status === 'pending').length,   color: '#F59E0B' },
    { name: 'Approved',  value: loans.filter(l => l.status === 'approved').length,  color: '#3B82F6' },
    { name: 'Disbursed', value: loans.filter(l => l.status === 'disbursed').length, color: '#10B981' },
  ].filter(d => d.value > 0)

  // ── Chart 3: Disbursed amount by month ─────────────────────
  const disbursedMap: Record<string, number> = {}
  loans.filter(l => l.status === 'disbursed').forEach(l => {
    const key = format(startOfMonth(parseISO(l.loanDate)), 'MMM yy')
    disbursedMap[key] = (disbursedMap[key] ?? 0) + l.amount
  })
  const barData = Object.entries(disbursedMap).map(([month, amount]) => ({ month, amount })).slice(-6)

  const recentLoans = [...loans].sort((a, b) => b.id - a.id).slice(0, 8)

  // Shared tooltip style
  const tooltipStyle = {
    contentStyle: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      color: 'var(--text-primary)',
      fontSize: '12px',
    },
    labelStyle: { color: 'var(--text-secondary)', fontWeight: 600 },
    cursor: { fill: 'var(--accent-tint)' },
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Welcome back! Here&apos;s your loan overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => router.push('/customers/add')}>
            <Plus size={13} /> Add Customer
          </Button>
          <Button size="sm" onClick={() => router.push('/loans/add')}>
            <Plus size={13} /> Add Loan
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {STAT_CFG.map(s => (
          <div key={s.key} className="rounded-xl p-4 transition-shadow hover:shadow-md"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${s.color}18` }}>
              <s.icon size={17} style={{ color: s.color }} />
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{values[s.key]}</div>
            <div className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area Chart — Loan Trend */}
        <div className="lg:col-span-2 rounded-xl p-5"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Loan Trend</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Monthly loan count over time</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Loans']} />
              <Area type="monotone" dataKey="loans" stroke="#3B82F6" strokeWidth={2}
                fill="url(#loanGrad)" dot={{ fill: '#3B82F6', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut — Loan Status */}
        <div className="rounded-xl p-5"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Loan Status</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Distribution by status</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                paddingAngle={3} dataKey="value">
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle.contentStyle}
                labelStyle={tooltipStyle.labelStyle}
                formatter={(v, name) => [v, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {donutData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart — Disbursed Amount */}
      <div className="rounded-xl p-5"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div className="mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Disbursed Amount</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Monthly disbursement in ₹</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={32}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10B981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={(v) => [formatINR(Number(v)), 'Disbursed']} />
            <Bar dataKey="amount" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Loans Table */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Loans</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Latest {recentLoans.length} entries</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => router.push('/loans/list')}>View All →</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--hover)', borderBottom: '1px solid var(--border)' }}>
                {['Loan ID', 'Customer', 'Employee', 'Amount', 'Installments', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLoans.map((loan, i) => {
                const customer = customers.find(c => c.id === loan.customerId)
                const employee = employees.find(e => e.id === loan.employeeId)
                return (
                  <tr key={loan.id} className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--hover)' : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-tint)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? 'var(--hover)' : 'transparent')}>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--accent)' }}>{loan.loanNo}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{customer?.name ?? '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{employee?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{formatINR(loan.amount)}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{loan.installments}</td>
                    <td className="px-4 py-3"><Badge status={loan.status} /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {format(parseISO(loan.loanDate), 'dd/MM/yyyy')}
                    </td>
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
