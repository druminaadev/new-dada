'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { WebcamCapture } from '@/components/ui/WebcamCapture'
import { PageHeader } from '@/components/layout/PageHeader'
import { useStore, type Nominee, type Guarantor } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'

const IDENTITY_PROOFS = ['Aadhar Card', 'PAN Card', 'Voter ID', 'Passport', 'Driving License']
const RELATIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other']
const TABS = ['Nominee', 'Guarantor 1', 'Guarantor 2'] as const

interface StakeholderForm {
  identityProof: string; identityNo: string; name: string; relation: string
  dob: string; age: string; mobile: string; address: string
  accountNo: string; holderName: string; bankName: string; bankBranch: string; ifsc: string
}

function StakeholderFormPanel({ initial, onSave, label }: { initial: Nominee | Guarantor | null; onSave: (d: StakeholderForm, photo: string) => void; label: string }) {
  const [photo, setPhoto] = useState(initial?.photoUrl ?? '')
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<StakeholderForm>({
    defaultValues: initial ? {
      identityProof: initial.identityProof, identityNo: initial.identityNo, name: initial.name,
      relation: initial.relation, dob: initial.dob, age: String(initial.age), mobile: initial.mobile,
      address: initial.address, accountNo: initial.accountNo, holderName: initial.holderName,
      bankName: initial.bankName, bankBranch: initial.bankBranch, ifsc: initial.ifsc,
    } : {}
  })
  const watchDob = watch('dob')
  if (watchDob) {
    const age = Math.floor((Date.now() - new Date(watchDob).getTime()) / (365.25 * 24 * 3600 * 1000))
    if (age > 0) setValue('age', String(age))
  }

  return (
    <form onSubmit={handleSubmit(d => onSave(d, photo))} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select label="Identity Proof" placeholder="Select ID Type" options={IDENTITY_PROOFS.map(p => ({ value: p, label: p }))} {...register('identityProof')} />
        <Input label="Identity Number" placeholder="ID document number" {...register('identityNo')} />
        <Input label="Full Name" required placeholder="Full name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
        <Select label="Relation" placeholder="Select Relation" options={RELATIONS.map(r => ({ value: r, label: r }))} {...register('relation')} />
        <Input label="Date of Birth" type="date" {...register('dob')} />
        <Input label="Age" type="number" placeholder="Auto-calculated" {...register('age')} />
        <Input label="Mobile Number" placeholder="10-digit mobile" error={errors.mobile?.message} {...register('mobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })} />
        <div className="sm:col-span-2"><Textarea label="Address" placeholder="Residential address" {...register('address')} /></div>
      </div>

      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-secondary)' }}>Bank Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Account Number" placeholder="Bank account number" {...register('accountNo')} />
          <Input label="Account Holder Name" placeholder="Name as on account" {...register('holderName')} />
          <Input label="Bank Name" placeholder="Bank name" {...register('bankName')} />
          <Input label="Bank Branch" placeholder="Branch name" {...register('bankBranch')} />
          <Input label="IFSC Code" placeholder="e.g. HDFC0001234" className="uppercase" {...register('ifsc')} />
        </div>
      </div>

      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-secondary)' }}>Profile Photo</h4>
        <WebcamCapture onCapture={setPhoto} current={photo} />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Update {label}</Button>
      </div>
    </form>
  )
}

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { customers, updateNominee, updateGuarantor } = useStore()
  const { showToast } = useUIStore()
  const [activeTab, setActiveTab] = useState(0)
  const customer = customers.find(c => c.id === Number(params.id))

  if (!customer) return (
    <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
      Customer not found.{' '}
      <button onClick={() => router.push('/customers/list')} className="underline cursor-pointer" style={{ color: 'var(--accent)' }}>
        Go back
      </button>
    </div>
  )

  const handleNomineeSave = (data: StakeholderForm, photo: string) => {
    updateNominee(customer.id, { identityProof: data.identityProof, identityNo: data.identityNo, name: data.name, relation: data.relation, dob: data.dob, age: Number(data.age), mobile: data.mobile, address: data.address, photoUrl: photo, accountNo: data.accountNo, holderName: data.holderName, bankName: data.bankName, bankBranch: data.bankBranch, ifsc: data.ifsc, documentUrl: '' })
    showToast('Nominee details saved', 'success')
  }
  const handleGuarantorSave = (slot: 1 | 2) => (data: StakeholderForm, photo: string) => {
    updateGuarantor(customer.id, slot, { slot, identityProof: data.identityProof, identityNo: data.identityNo, name: data.name, relation: data.relation, dob: data.dob, age: Number(data.age), mobile: data.mobile, address: data.address, photoUrl: photo, accountNo: data.accountNo, holderName: data.holderName, bankName: data.bankName, bankBranch: data.bankBranch, ifsc: data.ifsc, documentUrl: '' })
    showToast(`Guarantor ${slot} details saved`, 'success')
  }

  return (
    <>
      <PageHeader title={`Customer Details — ${customer.name}`} />

      {/* Customer summary card */}
      <div className="rounded-xl p-4 mb-4 flex items-center gap-4"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
          style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
          {customer.name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{customer.name}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {customer.appNo} · {customer.mobile} · {customer.aadhar}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className="px-6 py-3 text-sm font-medium transition-colors cursor-pointer"
              style={{
                color: activeTab === i ? 'var(--accent)' : 'var(--text-secondary)',
                background: activeTab === i ? 'var(--accent-tint)' : 'transparent',
                borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (activeTab !== i) e.currentTarget.style.background = 'var(--hover)' }}
              onMouseLeave={e => { if (activeTab !== i) e.currentTarget.style.background = 'transparent' }}>
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 0 && <StakeholderFormPanel initial={customer.nominee} onSave={handleNomineeSave} label="Nominee" />}
          {activeTab === 1 && <StakeholderFormPanel initial={customer.guarantor1} onSave={handleGuarantorSave(1)} label="Guarantor 1" />}
          {activeTab === 2 && <StakeholderFormPanel initial={customer.guarantor2} onSave={handleGuarantorSave(2)} label="Guarantor 2" />}
        </div>
      </div>
    </>
  )
}
