'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'

interface LoanForm {
  customerId: string; employeeId: string; loanDate: string; emiStartDate: string
  loanTypeId: string; amount: string; installments: string; interestRate: string
  fileCharges: string; otherCharges: string; intervalDays: string; remarks: string
  modelName: string; regNo: string; chassisNo: string; keys: string; rcReceived: string
  itemName: string; weight: string; pieces: string; receiverMobile: string
}

const INTERVALS = ['7 Days', '14 Days', 'Monthly', 'Quarterly']

export default function AddLoanPage() {
  const { customers, employees, loanTypes, addLoan } = useStore()
  const { showToast } = useUIStore()
  const router = useRouter()
  const [interestAmount, setInterestAmount] = useState(0)
  const [securityType, setSecurityType] = useState<'vehicle' | 'gold'>('vehicle')
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoanForm>({
    defaultValues: { loanDate: new Date().toISOString().split('T')[0], emiStartDate: new Date().toISOString().split('T')[0], rcReceived: 'yes', fileCharges: '0', otherCharges: '0' }
  })

  const watchAmount = watch('amount'), watchRate = watch('interestRate'), watchInstallments = watch('installments')
  useEffect(() => {
    const amt = Number(watchAmount) || 0, rate = Number(watchRate) || 0, inst = Number(watchInstallments) || 0
    if (amt && rate && inst) setInterestAmount(Math.round(amt * (rate / 100) * (inst / 12)))
  }, [watchAmount, watchRate, watchInstallments])

  const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const onSubmit = (data: LoanForm) => {
    addLoan({
      customerId: Number(data.customerId), employeeId: Number(data.employeeId),
      loanDate: data.loanDate, emiStartDate: data.emiStartDate, loanTypeId: Number(data.loanTypeId),
      amount: Number(data.amount), installments: Number(data.installments), interestRate: Number(data.interestRate),
      interestAmount, fileCharges: Number(data.fileCharges), otherCharges: Number(data.otherCharges),
      intervalDays: data.intervalDays, remarks: data.remarks,
      security: { type: securityType, ...(securityType === 'vehicle' ? { modelName: data.modelName, regNo: data.regNo, chassisNo: data.chassisNo, keys: data.keys, rcReceived: data.rcReceived === 'yes' } : { itemName: data.itemName, weight: Number(data.weight), pieces: Number(data.pieces) }), fileUrls: [] },
      receiver: { mobile: data.receiverMobile, documentUrl: '' },
    })
    showToast('Loan registered successfully!', 'success')
    router.push('/loans/list')
  }

  return (
    <>
      <PageHeader title="Add Loan" />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Card title="Loan Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select label="Customer" required placeholder="Select Customer" options={customers.map(c => ({ value: c.id, label: `${c.name} (${c.appNo})` }))} error={errors.customerId?.message} {...register('customerId', { required: 'Required' })} />
            <Select label="Employee" required placeholder="Select Employee" options={employees.map(e => ({ value: e.id, label: e.name }))} error={errors.employeeId?.message} {...register('employeeId', { required: 'Required' })} />
            <Input label="Loan Date" type="date" required {...register('loanDate', { required: 'Required' })} />
            <Input label="EMI Start Date" type="date" required {...register('emiStartDate', { required: 'Required' })} />
            <Select label="Loan Type" required placeholder="Select Loan Type" options={loanTypes.map(lt => ({ value: lt.id, label: lt.name }))} error={errors.loanTypeId?.message} {...register('loanTypeId', { required: 'Required' })} />
            <Input label="Loan Amount (₹)" type="number" required placeholder="e.g. 100000" error={errors.amount?.message} {...register('amount', { required: 'Required', min: { value: 1, message: 'Must be > 0' } })} />
            <Input label="No. of Installments" type="number" required placeholder="e.g. 12" error={errors.installments?.message} {...register('installments', { required: 'Required', min: { value: 1, message: 'Min 1' } })} />
            <Input label="Interest Rate (%)" type="number" step="0.1" required placeholder="e.g. 12" error={errors.interestRate?.message} {...register('interestRate', { required: 'Required' })} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Interest Amount (₹) — Auto</label>
              <div className="h-10 px-3 flex items-center text-sm bg-slate-50 border border-slate-200 rounded-md font-medium text-blue-800">{formatINR(interestAmount)}</div>
            </div>
            <Input label="File Charges (₹)" type="number" placeholder="0" {...register('fileCharges')} />
            <Input label="Other Charges (₹)" type="number" placeholder="0" {...register('otherCharges')} />
            <Select label="Interval Days" placeholder="Select Interval" options={INTERVALS.map(i => ({ value: i, label: i }))} {...register('intervalDays')} />
            <div className="sm:col-span-2 lg:col-span-3"><Textarea label="Remarks" placeholder="Additional notes..." {...register('remarks')} /></div>
          </div>
        </Card>
        <Card title="Security Deposit">
          <div className="flex gap-6 mb-5">
            {(['vehicle', 'gold'] as const).map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input type="radio" value={t} checked={securityType === t} onChange={() => setSecurityType(t)} className="accent-blue-800" />
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </label>
            ))}
          </div>
          {securityType === 'vehicle' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Vehicle Model" placeholder="e.g. Honda Activa" {...register('modelName')} />
              <Input label="Registration Number" placeholder="e.g. GJ01AB1234" {...register('regNo')} />
              <Input label="Chassis Number" placeholder="Chassis number" {...register('chassisNo')} />
              <Input label="Number of Keys" type="number" placeholder="e.g. 2" {...register('keys')} />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">RC Book Received</label>
                <div className="flex gap-4 mt-2">
                  {['yes', 'no'].map(v => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" value={v} {...register('rcReceived')} className="accent-blue-800" />{v === 'yes' ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          {securityType === 'gold' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Item Name" placeholder="e.g. Gold Necklace" {...register('itemName')} />
              <Input label="Weight (grams)" type="number" step="0.1" placeholder="e.g. 20" {...register('weight')} />
              <Input label="No. of Pieces" type="number" placeholder="e.g. 1" {...register('pieces')} />
            </div>
          )}
        </Card>
        <Card title="Receiver Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <Input label="Receiver Mobile" placeholder="10-digit mobile" {...register('receiverMobile')} />
          </div>
        </Card>
        <div className="flex gap-3">
          <Button type="submit">Register Loan</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/loans/list')}>Cancel</Button>
        </div>
      </form>
    </>
  )
}
