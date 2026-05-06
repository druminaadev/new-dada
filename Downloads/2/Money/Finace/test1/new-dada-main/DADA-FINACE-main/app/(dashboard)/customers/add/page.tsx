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
import { WebcamCapture } from '@/components/ui/WebcamCapture'
import { useStore } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'

interface CustomerForm {
  name: string; fatherName: string; motherName: string; dob: string; age: string
  gender: string; maritalStatus: string; bloodGroup: string; occupation: string
  regDate: string; mobile: string; altMobile: string; email: string
  aadhar: string; pan: string; jobAddress: string
  stateId: string; cityId: string; areaId: string; branchId: string; employeeId: string
  address: string; bankAccountNo: string; bankHolderName: string; bankName: string; bankBranch: string; bankIfsc: string
}

export default function AddCustomerPage() {
  const { states, cities, areas, branches, employees, addCustomer } = useStore()
  const { showToast } = useUIStore()
  const router = useRouter()
  const [photo, setPhoto] = useState('')
  const [filteredCities, setFilteredCities] = useState(cities)
  const [filteredAreas, setFilteredAreas] = useState(areas)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CustomerForm>({
    defaultValues: { regDate: new Date().toISOString().split('T')[0] }
  })

  const watchState = watch('stateId'), watchCity = watch('cityId'), watchDob = watch('dob')

  useEffect(() => {
    if (watchState) {
      setFilteredCities(cities.filter(c => c.stateId === Number(watchState)))
      setValue('cityId', ''); setValue('areaId', ''); setFilteredAreas([])
    }
  }, [watchState, cities, setValue])

  useEffect(() => {
    if (watchCity) { setFilteredAreas(areas.filter(a => a.cityId === Number(watchCity))); setValue('areaId', '') }
  }, [watchCity, areas, setValue])

  useEffect(() => {
    if (watchDob) {
      const age = Math.floor((Date.now() - new Date(watchDob).getTime()) / (365.25 * 24 * 3600 * 1000))
      setValue('age', String(age))
    }
  }, [watchDob, setValue])

  const onSubmit = (data: CustomerForm) => {
    addCustomer({
      name: data.name, fatherName: data.fatherName, motherName: data.motherName, dob: data.dob, age: Number(data.age),
      gender: data.gender, maritalStatus: data.maritalStatus, bloodGroup: data.bloodGroup, occupation: data.occupation,
      regDate: data.regDate, mobile: data.mobile, altMobile: data.altMobile, email: data.email,
      aadhar: data.aadhar, pan: data.pan.toUpperCase(), jobAddress: data.jobAddress,
      stateId: Number(data.stateId), cityId: Number(data.cityId), areaId: Number(data.areaId),
      branchId: Number(data.branchId), employeeId: Number(data.employeeId), photoUrl: photo,
      bank: { accountNo: data.bankAccountNo, holderName: data.bankHolderName, bankName: data.bankName, bankBranch: data.bankBranch, ifsc: data.bankIfsc.toUpperCase(), documentUrl: '' },
      nominee: null, guarantor1: null, guarantor2: null,
    })
    showToast('Customer registered successfully!', 'success')
    router.push('/customers/list')
  }

  return (
    <>
      <PageHeader title="Add Customer" />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Card title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Customer Name" required placeholder="Full name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
            <Input label="Father's Name" required placeholder="Father's full name" error={errors.fatherName?.message} {...register('fatherName', { required: 'Required' })} />
            <Input label="Mother's Name" placeholder="Mother's full name" {...register('motherName')} />
            <Input label="Date of Birth" type="date" required error={errors.dob?.message} {...register('dob', { required: 'Required' })} />
            <Input label="Age" type="number" placeholder="Auto-calculated" {...register('age')} />
            <Select label="Gender" required placeholder="Select Gender" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} error={errors.gender?.message} {...register('gender', { required: 'Required' })} />
            <Select label="Marital Status" placeholder="Select Status" options={[{ value: 'married', label: 'Married' }, { value: 'unmarried', label: 'Unmarried' }, { value: 'divorced', label: 'Divorced' }, { value: 'widowed', label: 'Widowed' }]} {...register('maritalStatus')} />
            <Input label="Blood Group" placeholder="e.g. B+" {...register('bloodGroup')} />
            <Input label="Occupation" placeholder="Current occupation" {...register('occupation')} />
            <Input label="Registration Date" type="date" {...register('regDate')} />
            <Input label="Mobile Number" required placeholder="10-digit mobile" error={errors.mobile?.message} {...register('mobile', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })} />
            <Input label="Alternative Mobile" placeholder="Secondary contact" {...register('altMobile')} />
            <Input label="Email ID" type="email" placeholder="email@example.com" {...register('email')} />
            <Input label="Aadhar No" required placeholder="12-digit Aadhar" error={errors.aadhar?.message} {...register('aadhar', { required: 'Required', pattern: { value: /^\d{12}$/, message: 'Must be 12 digits' } })} />
            <Input label="PAN No" placeholder="ABCDE1234F" className="uppercase" error={errors.pan?.message} {...register('pan', { pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]$/i, message: 'Invalid PAN' } })} />
            <Input label="Job Address" placeholder="Workplace address" {...register('jobAddress')} />
            <Select label="State" required placeholder="Select State" options={states.map(s => ({ value: s.id, label: s.name }))} error={errors.stateId?.message} {...register('stateId', { required: 'Required' })} />
            <Select label="City" required placeholder="Select City" options={filteredCities.map(c => ({ value: c.id, label: c.name }))} error={errors.cityId?.message} {...register('cityId', { required: 'Required' })} />
            <Select label="Area" placeholder="Select Area" options={filteredAreas.map(a => ({ value: a.id, label: a.name }))} {...register('areaId')} />
            <Select label="Branch" required placeholder="Select Branch" options={branches.map(b => ({ value: b.id, label: b.name }))} error={errors.branchId?.message} {...register('branchId', { required: 'Required' })} />
            <Select label="Assigned Employee" required placeholder="Select Employee" options={employees.map(e => ({ value: e.id, label: e.name }))} error={errors.employeeId?.message} {...register('employeeId', { required: 'Required' })} />
            <div className="sm:col-span-2 lg:col-span-3"><Textarea label="Residential Address" placeholder="Full residential address" {...register('address')} /></div>
          </div>
        </Card>
        <Card title="Bank Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Account Number" placeholder="Bank account number" {...register('bankAccountNo')} />
            <Input label="Account Holder Name" placeholder="Name as on account" {...register('bankHolderName')} />
            <Input label="Bank Name" placeholder="Bank name" {...register('bankName')} />
            <Input label="Bank Branch" placeholder="Branch name" {...register('bankBranch')} />
            <Input label="IFSC Code" placeholder="e.g. SBIN0001234" className="uppercase" error={errors.bankIfsc?.message} {...register('bankIfsc', { pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/i, message: 'Invalid IFSC' } })} />
          </div>
        </Card>
        <Card title="Profile Photo"><WebcamCapture onCapture={setPhoto} current={photo} /></Card>
        <div className="flex gap-3">
          <Button type="submit">Register Customer</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/customers/list')}>Cancel</Button>
        </div>
      </form>
    </>
  )
}
