'use client'
import { useState, useMemo } from 'react'
import { useStore, EMIInstalment } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useUIStore } from '@/store/uiStore'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth } from 'date-fns'

const DOT: Record<string, string> = {
  paid: 'bg-green-500',
  paid_late: 'bg-orange-500',
  overdue: 'bg-red-500',
  upcoming: 'bg-slate-300 dark:bg-slate-600',
}

export default function EMICalendarPage() {
  const { loans, customers, emis, employees, generateEMIs, collectEMI } = useStore()
  const { showToast } = useUIStore()
  const [selectedLoan, setSelectedLoan] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [collectModal, setCollectModal] = useState<EMIInstalment | null>(null)
  const [form, setForm] = useState({ paidAmount: '', paymentMode: 'Cash', collectedBy: '', paidDate: new Date().toISOString().split('T')[0] })

  const disbursedLoans = loans.filter(l => l.status === 'disbursed')
  const loanEmis = useMemo(() => emis.filter(e => e.loanId === Number(selectedLoan)), [emis, selectedLoan])

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startPad = getDay(startOfMonth(currentMonth))

  const emiByDate = useMemo(() => {
    const map: Record<string, EMIInstalment[]> = {}
    loanEmis.forEach(e => {
      if (!map[e.dueDate]) map[e.dueDate] = []
      map[e.dueDate].push(e)
    })
    return map
  }, [loanEmis])

  function handleGenerate() {
    if (!selectedLoan) return
    generateEMIs(Number(selectedLoan))
    showToast('EMI schedule generated!', 'success')
  }

  function handleCollect() {
    if (!collectModal) return
    collectEMI(collectModal.id, Number(form.paidAmount), form.paymentMode, Number(form.collectedBy), form.paidDate)
    showToast('EMI collected!', 'success')
    setCollectModal(null)
  }

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  return (
    <>
      <PageHeader title="EMI Calendar" />
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <Select label="Select Loan" placeholder="Choose disbursed loan..."
              options={disbursedLoans.map(l => {
                const c = customers.find(x => x.id === l.customerId)
                return { value: l.id, label: `${l.loanNo} — ${c?.name ?? ''}` }
              })}
              value={selectedLoan} onChange={e => setSelectedLoan(e.target.value)} />
          </div>
          {selectedLoan && loanEmis.length === 0 && (
            <Button onClick={handleGenerate}>Generate Schedule</Button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300">‹</button>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={nextMonth} className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300">›</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd')
              const dayEmis = emiByDate[key] ?? []
              const isToday = key === new Date().toISOString().split('T')[0]
              return (
                <div key={key} className={`min-h-14 rounded-lg p-1.5 border transition-colors ${isToday ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {format(day, 'd')}
                  </div>
                  {dayEmis.map(emi => (
                    <button key={emi.id} onClick={() => (emi.status === 'overdue' || emi.status === 'upcoming') && (setCollectModal(emi), setForm(f => ({ ...f, paidAmount: String(emi.emiAmount) })))}
                      className={`w-full text-left rounded px-1 py-0.5 mb-0.5 flex items-center gap-1 cursor-pointer hover:opacity-80`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[emi.status]}`} />
                      <span className="text-[10px] text-slate-700 dark:text-slate-300 truncate">EMI #{emi.instNo}</span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>

          <div className="flex gap-4 mt-4 flex-wrap">
            {[['paid', 'Paid on time'], ['paid_late', 'Paid late'], ['overdue', 'Overdue'], ['upcoming', 'Upcoming']].map(([s, l]) => (
              <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className={`w-2.5 h-2.5 rounded-full ${DOT[s]}`} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!collectModal} onClose={() => setCollectModal(null)} title={`Collect EMI #${collectModal?.instNo}`}>
        <div className="flex flex-col gap-4">
          <Input label="Amount (₹)" type="number" value={form.paidAmount} onChange={e => setForm(f => ({ ...f, paidAmount: e.target.value }))} />
          <Select label="Payment Mode" options={['Cash', 'UPI', 'Bank Transfer'].map(v => ({ value: v, label: v }))}
            value={form.paymentMode} onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))} />
          <Select label="Collected By" placeholder="Select employee"
            options={employees.map(e => ({ value: e.id, label: e.name }))}
            value={form.collectedBy} onChange={e => setForm(f => ({ ...f, collectedBy: e.target.value }))} />
          <Input label="Collection Date" type="date" value={form.paidDate} onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCollect}>Save Collection</Button>
            <Button variant="outline" onClick={() => setCollectModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}


