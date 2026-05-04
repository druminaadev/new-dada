'use client'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Eye } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable } from '@/components/ui/Table'
import { useStore, type Customer } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'
import { format } from 'date-fns'

export default function CustomerListPage() {
  const { customers, branches, employees, deleteCustomer } = useStore()
  const { showToast } = useUIStore()
  const router = useRouter()

  const remove = (c: Customer) => {
    deleteCustomer(c.id)
    showToast(`Customer "${c.name}" deleted`, 'warning')
  }

  const enriched = customers.map(c => ({
    ...c,
    branchName: branches.find(b => b.id === c.branchId)?.name ?? '—',
    employeeName: employees.find(e => e.id === c.employeeId)?.name ?? '—',
    regDateFmt: format(new Date(c.regDate), 'dd/MM/yyyy'),
  }))

  return (
    <>
      <PageHeader title="Customer List" action={{ label: 'Add Customer', onClick: () => router.push('/customers/add'), icon: <Plus size={13} /> }} />
      <DataTable data={enriched} searchPlaceholder="Search customers..." columns={[
        { key: 'appNo', header: 'App No' }, { key: 'name', header: 'Customer Name' },
        { key: 'mobile', header: 'Mobile' }, { key: 'aadhar', header: 'Aadhar' },
        { key: 'branchName', header: 'Branch' }, { key: 'employeeName', header: 'Employee' }, { key: 'regDateFmt', header: 'Reg. Date' },
        { key: 'actions', header: 'Actions', sortable: false, accessor: (row) => {
          const c = row as unknown as Customer
          return (
            <div className="flex gap-1.5">
              <button title="View Details" onClick={() => router.push(`/customers/${c.id}/details`)} className="p-1.5 rounded hover:bg-blue-50 text-blue-700 cursor-pointer"><Eye size={13} /></button>
              <button title="Edit" onClick={() => router.push(`/customers/${c.id}/details`)} className="p-1.5 rounded hover:bg-blue-50 text-blue-700 cursor-pointer"><Pencil size={13} /></button>
              <button title="Delete" onClick={() => remove(c)} className="p-1.5 rounded hover:bg-red-50 text-red-600 cursor-pointer"><Trash2 size={13} /></button>
            </div>
          )
        }}
      ]} />
    </>
  )
}
