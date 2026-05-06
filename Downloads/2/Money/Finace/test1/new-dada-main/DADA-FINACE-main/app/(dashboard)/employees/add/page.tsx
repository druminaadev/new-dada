'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'

interface EmployeeForm { name: string; code: string; branchId: string; contact: string; role: string; email: string }
const ROLES = ['Loan Officer', 'Senior Officer', 'Branch Manager', 'Accountant', 'Field Agent']

export default function AddEmployeePage() {
  const { branches, addEmployee } = useStore()
  const { showToast } = useUIStore()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EmployeeForm>()

  const onSubmit = (data: EmployeeForm) => {
    addEmployee({ ...data, branchId: Number(data.branchId) })
    showToast('Employee added successfully!', 'success')
    reset()
    router.push('/employees/list')
  }

  return (
    <>
      <PageHeader title="Add Employee" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card title="Employee Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Employee Name" required placeholder="Full name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
            <Input label="Employee Code" required placeholder="e.g. EMP006" error={errors.code?.message} {...register('code', { required: 'Required' })} />
            <Select label="Branch" required placeholder="Select Branch" options={branches.map(b => ({ value: b.id, label: b.name }))} error={errors.branchId?.message} {...register('branchId', { required: 'Required' })} />
            <Input label="Contact Number" required placeholder="10-digit mobile" error={errors.contact?.message} {...register('contact', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })} />
            <Select label="Role / Designation" required placeholder="Select Role" options={ROLES.map(r => ({ value: r, label: r }))} error={errors.role?.message} {...register('role', { required: 'Required' })} />
            <Input label="Email ID" placeholder="employee@company.com" type="email" {...register('email')} />
          </div>
        </Card>
        <div className="flex gap-3 mt-4">
          <Button type="submit">Save Employee</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/employees/list')}>Cancel</Button>
        </div>
      </form>
    </>
  )
}
