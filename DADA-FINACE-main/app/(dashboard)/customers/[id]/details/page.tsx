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
  const onSubmit = (data: StakeholderForm) => onSave(data, photo)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-xs font-semibold text-slate-600 uppercase mb-3">Bank Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Account Number" placeholder="Bank account number" {...register('accountNo')} />
          <Input label="Account Holder Name" placeholder="Name as on account" {...register('holderName')} />
          <Input label="Bank Name" placeholder="Bank name" {...register('bankName')} />
          <Input label="Bank Branch" placeholder="Branch name" {...register('bankBranch')} />
          <Input label="IFSC Code" placeholder="e.g. HDFC0001234" className="uppercase" {...register('ifsc')} />
        </div>
      </div>
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-xs font-semibold text-slate-600 uppercase mb-3">Profile Photo</h4>
        <WebcamCapture onCapture={setPhoto} current={photo} />
      </div>
      <div className="flex justify-end"><Button type="submit">Update {label}</Button></div>
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
    <div className="text-center py-20 text-slate-500">
      Customer not found. <button onClick={() => router.push('/customers/list')} className="text-blue-700 underline cursor-pointer">Go back</button>
    </div>
  )

  const handleNomineeSave = (data: StakeholderForm, photo: string) => {
    updateNominee(customer.id, { identityProof: data.identityProof, identityNo: data.identityNo, name: data.name, relation: data.relation, dob: data.dob, age: Number(data.age), mobile: data.mobile, address: data.address, photoUrl: photo, accountNo: data.accountNo, holderName: data.holderName, bankName: data.bankName, bankBranch: data.bankBranch, ifsc: data.ifsc, documentUrl: '' })
    showToast('Nominee details saved successfully', 'success')
  }
  const handleGuarantorSave = (slot: 1 | 2) => (data: StakeholderForm, photo: string) => {
    updateGuarantor(customer.id, slot, { slot, identityProof: data.identityProof, identityNo: data.identityNo, name: data.name, relation: data.relation, dob: data.dob, age: Number(data.age), mobile: data.mobile, address: data.address, photoUrl: photo, accountNo: data.accountNo, holderName: data.holderName, bankName: data.bankName, bankBranch: data.bankBranch, ifsc: data.ifsc, documentUrl: '' })
    showToast(`Guarantor ${slot} details saved successfully`, 'success')
  }

  return (
    <>
      <PageHeader title={`Customer Details — ${customer.name}`} />
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-lg">{customer.name.charAt(0)}</div>
        <div>
          <div className="font-semibold text-slate-900">{customer.name}</div>
          <div className="text-xs text-slate-500">{customer.appNo} · {customer.mobile} · {customer.aadhar}</div>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="border-b border-slate-200 flex">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === i ? 'border-blue-800 text-blue-800 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
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
