'use client'
import { useState, useMemo } from 'react'
import { Calculator, Percent, IndianRupee, Clock, ChevronRight, Info } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

/* ── helpers ─────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

/* ── types ───────────────────────────────────────────────── */
type Tab = 'flat' | 'reducing'
type Tenure = 'months' | 'years'

interface Inputs {
  principal: number
  rate: number
  tenure: number
  tenureType: Tenure
}

interface FlatResult {
  totalInterest: number
  totalPayable: number
  monthlyPayment: number
  months: number
}

interface EMIResult {
  emi: number
  totalInterest: number
  totalPayable: number
  months: number
  schedule: { month: number; emi: number; principal: number; interest: number; balance: number }[]
}

/* ── calculations ────────────────────────────────────────── */
function calcFlat(p: number, rate: number, months: number): FlatResult {
  const totalInterest = (p * (rate / 100) * months) / 12
  const totalPayable = p + totalInterest
  const monthlyPayment = totalPayable / months
  return { totalInterest, totalPayable, monthlyPayment, months }
}

function calcEMI(p: number, rate: number, months: number): EMIResult {
  const r = rate / 100 / 12
  const emi = r === 0 ? p / months : (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
  const totalPayable = emi * months
  const totalInterest = totalPayable - p

  // amortisation schedule
  let balance = p
  const schedule = []
  for (let i = 1; i <= months; i++) {
    const interest = balance * r
    const principal = emi - interest
    balance = Math.max(0, balance - principal)
    schedule.push({ month: i, emi: Math.round(emi), principal: Math.round(principal), interest: Math.round(interest), balance: Math.round(balance) })
  }

  return { emi, totalInterest, totalPayable, months, schedule }
}

/* ── ParamField: label + number input + slider in one block ── */
interface ParamFieldProps {
  label: string
  icon: React.ReactNode
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  displayValue: string          // formatted value shown in the input box
  parseInput: (raw: string) => number  // convert typed string → number
  minLabel: string
  maxLabel: string
  error?: string
  suffix?: React.ReactNode       // optional right-side slot (e.g. months/years toggle)
}

function ParamField({
  label, icon, value, min, max, step, onChange,
  displayValue, parseInput, minLabel, maxLabel, error, suffix
}: ParamFieldProps) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  return (
    <div className="flex flex-col gap-2.5">
      {/* Row 1: label + value input */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent-tint)' }}
          >
            {icon}
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {suffix}
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => {
              const v = parseInput(e.target.value)
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
            }}
            className="w-24 h-8 px-2.5 text-sm font-bold text-right rounded-lg outline-none tabular-nums"
            style={{
              background: 'var(--form-field)',
              color: 'var(--accent)',
              border: `1.5px solid ${error ? 'var(--error)' : 'var(--accent)'}`,
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-tint)')}
            onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
          />
        </div>
      </div>

      {/* Row 2: slider track */}
      <div className="relative h-5 flex items-center px-0.5">
        {/* track bg */}
        <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ background: 'var(--border)' }} />
        {/* fill */}
        <div
          className="absolute h-1.5 rounded-full"
          style={{ width: `${pct}%`, background: 'var(--accent)' }}
        />
        {/* native range (invisible, on top) */}
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full opacity-0 cursor-pointer h-5"
          style={{ zIndex: 2 }}
        />
        {/* custom thumb */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 shadow pointer-events-none"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: 'var(--bg)',
            borderColor: 'var(--accent)',
            zIndex: 1,
            transition: 'left 0.05s',
          }}
        />
      </div>

      {/* Row 3: min / max labels */}
      <div className="flex justify-between text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>

      {error && (
        <p className="text-[11px] -mt-1" style={{ color: 'var(--error)' }}>{error}</p>
      )}
    </div>
  )
}

/* ── result card ─────────────────────────────────────────── */
function ResultCard({ label, value, sub, accent, large }: { label: string; value: string; sub?: string; accent?: boolean; large?: boolean }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1 transition-all"
      style={{
        background: accent ? 'var(--accent)' : 'var(--hover)',
        border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: accent ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)' }}>
        {label}
      </span>
      <span
        className={`font-bold tabular-nums leading-tight ${large ? 'text-2xl' : 'text-lg'}`}
        style={{ color: accent ? '#fff' : 'var(--text-primary)' }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[11px]" style={{ color: accent ? 'rgba(255,255,255,0.65)' : 'var(--text-secondary)' }}>
          {sub}
        </span>
      )}
    </div>
  )
}

/* ── main page ───────────────────────────────────────────── */
export default function CalculatorPage() {
  const [tab, setTab] = useState<Tab>('flat')
  const [inputs, setInputs] = useState<Inputs>({ principal: 100000, rate: 12, tenure: 12, tenureType: 'months' })
  const [errors, setErrors] = useState<Partial<Record<keyof Inputs, string>>>({})
  const [showSchedule, setShowSchedule] = useState(false)

  const months = inputs.tenureType === 'years' ? inputs.tenure * 12 : inputs.tenure

  const flat = useMemo(() => calcFlat(inputs.principal, inputs.rate, months), [inputs.principal, inputs.rate, months])
  const emi = useMemo(() => calcEMI(inputs.principal, inputs.rate, months), [inputs.principal, inputs.rate, months])

  const result = tab === 'flat' ? flat : emi

  const pieData = [
    { name: 'Principal', value: Math.round(inputs.principal), color: 'var(--accent)' },
    { name: 'Interest', value: Math.round(result.totalInterest), color: '#F59E0B' },
  ]

  function validate() {
    const e: typeof errors = {}
    if (!inputs.principal || inputs.principal <= 0) e.principal = 'Enter a valid loan amount'
    if (!inputs.rate || inputs.rate <= 0 || inputs.rate > 100) e.rate = 'Rate must be between 0–100%'
    if (!inputs.tenure || inputs.tenure <= 0) e.tenure = 'Enter a valid tenure'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function set(key: keyof Inputs, val: number | string) {
    setInputs(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'flat', label: 'Flat Interest' },
    { key: 'reducing', label: 'Reducing (EMI)' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Page heading ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
          <Calculator size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Interest & EMI Calculator</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Compare flat rate vs reducing balance interest
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all"
            style={{
              background: tab === t.key ? 'var(--accent)' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-secondary)',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left: Inputs ── */}
        <div className="lg:col-span-2 rounded-2xl p-5 flex flex-col gap-5"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>

          {/* Panel heading */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Loan Parameters</span>
            <span
              className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
            >
              {tab === 'flat' ? 'Flat Rate' : 'Reducing Balance'}
            </span>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* 1. Loan Amount */}
          <ParamField
            label="Loan Amount"
            icon={<IndianRupee size={12} style={{ color: 'var(--accent)' }} />}
            value={inputs.principal}
            min={10000} max={5000000} step={10000}
            onChange={v => set('principal', v)}
            displayValue={fmt(inputs.principal)}
            parseInput={raw => Number(raw)}
            minLabel="₹10,000"
            maxLabel="₹50,00,000"
            error={errors.principal}
          />

          {/* 2. Interest Rate */}
          <ParamField
            label="Interest Rate (% p.a.)"
            icon={<Percent size={12} style={{ color: 'var(--accent)' }} />}
            value={inputs.rate}
            min={1} max={36} step={0.5}
            onChange={v => set('rate', v)}
            displayValue={`${inputs.rate}%`}
            parseInput={raw => Number(raw)}
            minLabel="1%"
            maxLabel="36%"
            error={errors.rate}
          />

          {/* 3. Loan Tenure */}
          <ParamField
            label="Loan Tenure"
            icon={<Clock size={12} style={{ color: 'var(--accent)' }} />}
            value={inputs.tenure}
            min={1}
            max={inputs.tenureType === 'years' ? 30 : 360}
            step={1}
            onChange={v => set('tenure', v)}
            displayValue={`${inputs.tenure} ${inputs.tenureType === 'years' ? 'yr' : 'mo'}`}
            parseInput={raw => Number(raw)}
            minLabel={`1 ${inputs.tenureType}`}
            maxLabel={inputs.tenureType === 'years' ? '30 years' : '360 months'}
            error={errors.tenure}
            suffix={
              <div
                className="flex rounded-lg overflow-hidden"
                style={{ border: '1px solid var(--border)' }}
              >
                {(['months', 'years'] as Tenure[]).map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      set('tenureType', t)
                      // reset tenure to a sensible value when switching
                      set('tenure', t === 'years' ? 1 : 12)
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-all capitalize"
                    style={{
                      background: inputs.tenureType === t ? 'var(--accent)' : 'var(--form-field)',
                      color: inputs.tenureType === t ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {t === 'months' ? 'Mo' : 'Yr'}
                  </button>
                ))}
              </div>
            }
          />

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Calculate button */}
          <button
            onClick={validate}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Calculator size={15} /> Calculate
          </button>
        </div>

        {/* ── Right: Results ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Result cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tab === 'flat' ? (
              <>
                <ResultCard label="Monthly Payment" value={fmt(flat.monthlyPayment)} sub="per month" accent large />
                <ResultCard label="Total Interest" value={fmt(flat.totalInterest)} sub={`over ${months} months`} />
                <ResultCard label="Total Payable" value={fmt(flat.totalPayable)} sub="principal + interest" />
              </>
            ) : (
              <>
                <ResultCard label="Monthly EMI" value={fmt(emi.emi)} sub="per month" accent large />
                <ResultCard label="Total Interest" value={fmt(emi.totalInterest)} sub={`over ${months} months`} />
                <ResultCard label="Total Payable" value={fmt(emi.totalPayable)} sub="principal + interest" />
              </>
            )}
          </div>

          {/* Pie chart + breakdown */}
          <div className="rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>

            <div className="w-44 h-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                    paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color === 'var(--accent)' ? '#5B7FA6' : '#F59E0B'} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }}
                    formatter={(v) => [fmt(Number(v))]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 w-full flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                Loan Breakdown
              </p>

              {/* Principal bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#5B7FA6' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Principal</span>
                  </span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(inputs.principal)}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(inputs.principal / result.totalPayable) * 100}%`, background: '#5B7FA6' }} />
                </div>
                <div className="text-[10px] text-right" style={{ color: 'var(--text-secondary)' }}>
                  {((inputs.principal / result.totalPayable) * 100).toFixed(1)}% of total
                </div>
              </div>

              {/* Interest bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span style={{ color: 'var(--text-secondary)' }}>Interest</span>
                  </span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(result.totalInterest)}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${(result.totalInterest / result.totalPayable) * 100}%` }} />
                </div>
                <div className="text-[10px] text-right" style={{ color: 'var(--text-secondary)' }}>
                  {((result.totalInterest / result.totalPayable) * 100).toFixed(1)}% of total
                </div>
              </div>

              {/* Effective rate info */}
              <div className="flex items-start gap-2 mt-1 p-2.5 rounded-lg" style={{ background: 'var(--hover)' }}>
                <Info size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {tab === 'flat'
                    ? `Flat rate of ${inputs.rate}% p.a. — interest is fixed on the original principal throughout the tenure.`
                    : `Reducing balance at ${inputs.rate}% p.a. — interest decreases each month as principal reduces.`}
                </p>
              </div>
            </div>
          </div>

          {/* Comparison strip (only when both are calculated) */}
          <div className="rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between"
            style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Quick Comparison
            </div>
            <div className="flex gap-4 text-xs">
              <div className="text-center">
                <div className="font-bold" style={{ color: tab === 'flat' ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {fmt(flat.monthlyPayment)}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Flat / month</div>
              </div>
              <div className="flex items-center" style={{ color: 'var(--border)' }}>vs</div>
              <div className="text-center">
                <div className="font-bold" style={{ color: tab === 'reducing' ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  {fmt(emi.emi)}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>EMI / month</div>
              </div>
              <div className="flex items-center" style={{ color: 'var(--border)' }}>·</div>
              <div className="text-center">
                <div className="font-bold text-amber-500">
                  {fmt(Math.abs(flat.totalInterest - emi.totalInterest))}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {flat.totalInterest > emi.totalInterest ? 'Flat costs more' : 'EMI costs more'}
                </div>
              </div>
            </div>
          </div>

          {/* EMI Schedule toggle (reducing only) */}
          {tab === 'reducing' && (
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                onClick={() => setShowSchedule(p => !p)}
                className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors"
                style={{ background: 'var(--bg)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Amortisation Schedule
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{months} months</span>
                  <ChevronRight
                    size={15}
                    style={{
                      color: 'var(--text-secondary)',
                      transition: 'transform 0.2s',
                      transform: showSchedule ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>
              </button>

              {showSchedule && (
                <div className="overflow-x-auto max-h-72 overflow-y-auto" style={{ borderTop: '1px solid var(--border)' }}>
                  <table className="w-full text-xs">
                    <thead className="sticky top-0" style={{ background: 'var(--hover)' }}>
                      <tr>
                        {['Month', 'EMI', 'Principal', 'Interest', 'Balance'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide"
                            style={{ color: 'var(--text-secondary)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {emi.schedule.map((row, i) => (
                        <tr key={row.month}
                          style={{
                            background: i % 2 === 1 ? 'var(--hover)' : 'var(--bg)',
                            borderTop: '1px solid var(--border)',
                          }}>
                          <td className="px-4 py-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{row.month}</td>
                          <td className="px-4 py-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(row.emi)}</td>
                          <td className="px-4 py-2" style={{ color: '#5B7FA6' }}>{fmt(row.principal)}</td>
                          <td className="px-4 py-2" style={{ color: '#F59E0B' }}>{fmt(row.interest)}</td>
                          <td className="px-4 py-2" style={{ color: 'var(--text-secondary)' }}>{fmt(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
