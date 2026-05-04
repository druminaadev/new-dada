'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useStore, type Employee } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'

const ROLES = ['Loan Officer', 'Senior Officer', 'Branch Manager', 'Accountant', 'Field Agent']

export default function EmployeeListPage() {
  const { employees, branches, updateEmployee, deleteEmployee } = useStore()
  const { showToast } = useUIStore()
  const router = useRouter()
  const [editModal, setEditModal] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState({ name: '', code: '', branchId: '', contact: '', role: '', email: '' })

  const openEdit = (e: Employee) => {
    setEditing(e)
    setForm({ name: e.name, code: e.code, branchId: String(e.branchId), contact: e.contact, role: e.role, email: e.email })
    setEditModal(true)
  }
  const save = () => {
    if (!editing) return
    updateEmployee(editing.id, { ...form, branchId: Number(form.branchId) })
    showToast('Employee updated successfully', 'success')
    setEditModal(false)
  }
  const remove = (id: number) => {
    deleteEmployee(id)
    showToast('Employee deleted', 'warning')
  }
  const enriched = employees.map(e => ({ ...e, branchName: branches.find(b => b.id === e.branchId)?.name ?? '—' }))

  return (
    <>
      <PageHeader title="Employee List" action={{ label: 'Add Employee', onClick: () => router.push('/employees/add'), icon: <Plus size={13} /> }} />
      <DataTable data={enriched} searchPlaceholder="Search employees..." columns={[
        { key: 'id', header: '#', width: 'w-12' }, { key: 'code', header: 'Code' }, { key: 'name', header: 'Name' },
        { key: 'role', header: 'Role' }, { key: 'branchName', header: 'Branch' }, { key: 'contact', header: 'Contact' }, { key: 'email', header: 'Email' },
        { key: 'actions', header: 'Actions', sortable: false, accessor: (row) => (
          <div className="flex gap-2">
            <button onClick={() => openEdit(row as unknown as Employee)} className="p-1.5 rounded hover:bg-blue-50 text-blue-700 cursor-pointer"><Pencil size={13} /></button>
            <button onClick={() => remove((row as unknown as Employee).id)} className="p-1.5 rounded hover:bg-red-50 text-red-600 cursor-pointer"><Trash2 size={13} /></button>
          </div>
        )}
      ]} />
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Employee">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Code" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} required />
          <Select label="Branch" value={form.branchId} onChange={e => setForm(p => ({ ...p, branchId: e.target.value }))} options={branches.map(b => ({ value: b.id, label: b.name }))} placeholder="Select Branch" required />
          <Input label="Contact" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} required />
          <Select label="Role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} options={ROLES.map(r => ({ value: r, label: r }))} placeholder="Select Role" required />
          <Input label="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" />
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" size="sm" onClick={() => setEditModal(false)}>Cancel</Button>
          <Button size="sm" onClick={save}>Update</Button>
        </div>
      </Modal>
    </>
  )
}
