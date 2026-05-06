'use client'
import { useState, useMemo } from 'react'
import { useStore, EMIInstalment } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { format, parseISO } from 'date-fns'

const statusColor: Record<string, string> = {
  upcoming: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  paid_late: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

export default function EMICollectionPage() {
  const { loans, customers, employees, emis, generateEMIs, collectEMI } = useStore()
  const { showToast } = useUIStore()
  const [selectedLoan, setSelectedLoan] = useState('')
  const [collectModal, setCollectModal] = useState<EMIInstalment | null>(null)
  const [form, setForm] = useState({ paidAmount: '', paymentMode: 'Cash', collectedBy: '', paidDate: new Date().toISOString().split('T')[0] })

  const disbursedLoans = loans.filter(l => l.status === 'disbursed')
  const loanEmis = useMemo(() => emis.filter(e => e.loanId === Number(selectedLoan)), [emis, selectedLoan])
  const loan = disbursedLoans.find(l => l.id === Number(selectedLoan))
  const customer = loan ? customers.find(c => c.id === loan.customerId) : null

  const totalCollected = loanEmis.filter(e => e.status === 'paid' || e.status === 'paid_late').reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const totalOutstanding = loanEmis.filter(e => e.status !== 'paid' && e.status !== 'paid_late').reduce((s, e) => s + e.emiAmount, 0)

  function handleGenerate() {
    if (!selectedLoan) return
    generateEMIs(Number(selectedLoan))
    showToast('EMI schedule generated!', 'success')
  }

  function handleCollect() {
    if (!collectModal) return
    collectEMI(collectModal.id, Number(form.paidAmount), form.paymentMode, Number(form.collectedBy), form.paidDate)
    showToast('EMI collected successfully!', 'success')
    setCollectModal(null)
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <>
      <PageHeader title="EMI Collection" />
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <Select label="Select Disbursed Loan" placeholder="Choose loan..."
                options={disbursedLoans.map(l => {
                  const c = customers.find(x => x.id === l.customerId)
                  return { value: l.id, label: `${l.loanNo} — ${c?.name ?? ''}` }
                })}
                value={selectedLoan} onChange={e => setSelectedLoan(e.target.value)} />
            </div>
            {selectedLoan && loanEmis.length === 0 && (
              <Button onClick={handleGenerate}>Generate EMI Schedule</Button>
            )}
          </div>
          {customer && loan && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Customer', value: customer.name },
                { label: 'Loan Amount', value: fmt(loan.amount) },
                { label: 'Collected', value: fmt(totalCollected) },
                { label: 'Outstanding', value: fmt(totalOutstanding) },
              ].map(s => (
                <div key={s.label} className="rounded-lg p-3 bg-slate-50 dark:bg-slate-700/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {loanEmis.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    {['#', 'Due Date', 'EMI Amount', 'Principal', 'Interest', 'Outstanding', 'Status', 'Paid Date', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loanEmis.map((emi, i) => (
                    <tr key={emi.id} className={`border-b border-slate-100 dark:border-slate-700 ${i % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{emi.instNo}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{format(parseISO(emi.dueDate), 'dd/MM/yyyy')}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{fmt(emi.emiAmount)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmt(emi.principal)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmt(emi.interest)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmt(emi.outstanding)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[emi.status]}`}>
                          {emi.status.replace('_', ' ')}
                        </span>
                        {emi.penaltyAmount ? <span className="ml-1 text-xs text-red-500">+{fmt(emi.penaltyAmount)} penalty</span> : null}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {emi.paidDate ? format(parseISO(emi.paidDate), 'dd/MM/yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {(emi.status === 'overdue' || emi.status === 'upcoming') && (
                          <Button size="sm" onClick={() => { setCollectModal(emi); setForm(f => ({ ...f, paidAmount: String(emi.emiAmount) })) }}>
                            Collect
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
