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
              {[
                { icon: Eye,    title: 'View', action: () => router.push(`/customers/${c.id}/details`), color: 'var(--accent)', tint: 'var(--accent-tint)' },
                { icon: Pencil, title: 'Edit', action: () => router.push(`/customers/${c.id}/details`), color: 'var(--accent)', tint: 'var(--accent-tint)' },
                { icon: Trash2, title: 'Delete', action: () => { deleteCustomer(c.id); showToast(`Customer "${c.name}" deleted`, 'warning') }, color: 'var(--error)', tint: 'var(--error-tint)' },
              ].map(btn => (
                <button key={btn.title} title={btn.title} onClick={btn.action}
                  className="p-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{ color: btn.color }}
                  onMouseEnter={e => (e.currentTarget.style.background = btn.tint)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <btn.icon size={13} />
                </button>
              ))}
            </div>
          )
        }},
      ]} />
    </>
  )
}
