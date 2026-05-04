'use client'
import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useStore } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'

export function StatePage() {
  const { states, addState, updateState, deleteState } = useStore()
  const { showToast } = useUIStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null)
  const [name, setName] = useState('')

  const openAdd = () => { setEditing(null); setName(''); setOpen(true) }
  const openEdit = (s: { id: number; name: string }) => { setEditing(s); setName(s.name); setOpen(true) }
  const save = () => {
    if (!name.trim()) return
    if (editing) { updateState(editing.id, { name }); showToast('State updated successfully', 'success') }
    else { addState({ name }); showToast('State added successfully', 'success') }
    setOpen(false)
  }
  const remove = (id: number) => { deleteState(id); showToast('State deleted', 'warning') }

  return (
    <>
      <PageHeader title="States" action={{ label: 'Add State', onClick: openAdd, icon: <Plus size={13} /> }} />
      <DataTable data={states} searchPlaceholder="Search states..." columns={[
        { key: 'id', header: '#', width: 'w-16' }, { key: 'name', header: 'State Name' },
        { key: 'actions', header: 'Actions', sortable: false, accessor: (row) => (
          <div className="flex gap-2">
            <button onClick={() => openEdit(row)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 cursor-pointer"><Pencil size={13} /></button>
            <button onClick={() => remove(row.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
          </div>
        )}
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit State' : 'Add State'} size="sm">
        <div className="flex flex-col gap-4">
          <Input label="State Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gujarat" required />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export function CityPage() {
  const { cities, states, addCity, updateCity, deleteCity } = useStore()
  const { showToast } = useUIStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: number; stateId: number; name: string } | null>(null)
  const [form, setForm] = useState({ name: '', stateId: '' })

  const openAdd = () => { setEditing(null); setForm({ name: '', stateId: '' }); setOpen(true) }
  const openEdit = (c: { id: number; stateId: number; name: string }) => { setEditing(c); setForm({ name: c.name, stateId: String(c.stateId) }); setOpen(true) }
  const save = () => {
    if (!form.name.trim() || !form.stateId) return
    const d = { name: form.name, stateId: Number(form.stateId) }
    if (editing) { updateCity(editing.id, d); showToast('City updated successfully', 'success') }
    else { addCity(d); showToast('City added successfully', 'success') }
    setOpen(false)
  }
  const remove = (id: number) => { deleteCity(id); showToast('City deleted', 'warning') }
  const enriched = cities.map(c => ({ ...c, stateName: states.find(s => s.id === c.stateId)?.name ?? '' }))

  return (
    <>
      <PageHeader title="Cities" action={{ label: 'Add City', onClick: openAdd, icon: <Plus size={13} /> }} />
      <DataTable data={enriched} searchPlaceholder="Search cities..." columns={[
        { key: 'id', header: '#', width: 'w-16' }, { key: 'name', header: 'City Name' }, { key: 'stateName', header: 'State' },
        { key: 'actions', header: 'Actions', sortable: false, accessor: (row) => (
          <div className="flex gap-2">
            <button onClick={() => openEdit(row)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 cursor-pointer"><Pencil size={13} /></button>
            <button onClick={() => remove(row.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
          </div>
        )}
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit City' : 'Add City'} size="sm">
        <div className="flex flex-col gap-4">
          <Select label="State" value={form.stateId} onChange={e => setForm(p => ({ ...p, stateId: e.target.value }))} options={states.map(s => ({ value: s.id, label: s.name }))} placeholder="Select State" required />
          <Input label="City Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ahmedabad" required />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export function AreaPage() {
  const { areas, cities, states, addArea, updateArea, deleteArea } = useStore()
  const { showToast } = useUIStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: number; cityId: number; name: string } | null>(null)
  const [form, setForm] = useState({ name: '', cityId: '' })

  const openAdd = () => { setEditing(null); setForm({ name: '', cityId: '' }); setOpen(true) }
  const openEdit = (a: { id: number; cityId: number; name: string }) => { setEditing(a); setForm({ name: a.name, cityId: String(a.cityId) }); setOpen(true) }
  const save = () => {
    if (!form.name.trim() || !form.cityId) return
    const d = { name: form.name, cityId: Number(form.cityId) }
    if (editing) { updateArea(editing.id, d); showToast('Area updated successfully', 'success') }
    else { addArea(d); showToast('Area added successfully', 'success') }
    setOpen(false)
  }
  const remove = (id: number) => { deleteArea(id); showToast('Area deleted', 'warning') }
  const enriched = areas.map(a => {
    const city = cities.find(c => c.id === a.cityId)
    return { ...a, cityName: city?.name ?? '', stateName: states.find(s => s.id === city?.stateId)?.name ?? '' }
  })

  return (
    <>
      <PageHeader title="Areas" action={{ label: 'Add Area', onClick: openAdd, icon: <Plus size={13} /> }} />
      <DataTable data={enriched} searchPlaceholder="Search areas..." columns={[
        { key: 'id', header: '#', width: 'w-16' }, { key: 'name', header: 'Area Name' }, { key: 'cityName', header: 'City' }, { key: 'stateName', header: 'State' },
        { key: 'actions', header: 'Actions', sortable: false, accessor: (row) => (
          <div className="flex gap-2">
            <button onClick={() => openEdit(row)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 cursor-pointer"><Pencil size={13} /></button>
            <button onClick={() => remove(row.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
          </div>
        )}
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Area' : 'Add Area'} size="sm">
        <div className="flex flex-col gap-4">
          <Select label="City" value={form.cityId} onChange={e => setForm(p => ({ ...p, cityId: e.target.value }))} options={cities.map(c => ({ value: c.id, label: c.name }))} placeholder="Select City" required />
          <Input label="Area Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Navrangpura" required />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export function BranchPage() {
  const { branches, addBranch, updateBranch, deleteBranch } = useStore()
  const { showToast } = useUIStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: number; name: string; address: string } | null>(null)
  const [form, setForm] = useState({ name: '', address: '' })

  const openAdd = () => { setEditing(null); setForm({ name: '', address: '' }); setOpen(true) }
  const openEdit = (b: { id: number; name: string; address: string }) => { setEditing(b); setForm({ name: b.name, address: b.address }); setOpen(true) }
  const save = () => {
    if (!form.name.trim()) return
    if (editing) { updateBranch(editing.id, form); showToast('Branch updated successfully', 'success') }
    else { addBranch(form); showToast('Branch added successfully', 'success') }
    setOpen(false)
  }
  const remove = (id: number) => { deleteBranch(id); showToast('Branch deleted', 'warning') }

  return (
    <>
      <PageHeader title="Branches" action={{ label: 'Add Branch', onClick: openAdd, icon: <Plus size={13} /> }} />
      <DataTable data={branches} searchPlaceholder="Search branches..." columns={[
        { key: 'id', header: '#', width: 'w-16' }, { key: 'name', header: 'Branch Name' }, { key: 'address', header: 'Address' },
        { key: 'actions', header: 'Actions', sortable: false, accessor: (row) => (
          <div className="flex gap-2">
            <button onClick={() => openEdit(row)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 cursor-pointer"><Pencil size={13} /></button>
            <button onClick={() => remove(row.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
          </div>
        )}
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Branch' : 'Add Branch'} size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Branch Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Ahmedabad Main" required />
          <Input label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Branch address" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export function LoanTypePage() {
  const { loanTypes, addLoanType, updateLoanType, deleteLoanType } = useStore()
  const { showToast } = useUIStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: number; name: string; description: string } | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '' }); setOpen(true) }
  const openEdit = (lt: { id: number; name: string; description: string }) => { setEditing(lt); setForm({ name: lt.name, description: lt.description }); setOpen(true) }
  const save = () => {
    if (!form.name.trim()) return
    if (editing) { updateLoanType(editing.id, form); showToast('Loan type updated successfully', 'success') }
    else { addLoanType(form); showToast('Loan type added successfully', 'success') }
    setOpen(false)
  }
  const remove = (id: number) => { deleteLoanType(id); showToast('Loan type deleted', 'warning') }

  return (
    <>
      <PageHeader title="Loan Types" action={{ label: 'Add Loan Type', onClick: openAdd, icon: <Plus size={13} /> }} />
      <DataTable data={loanTypes} searchPlaceholder="Search loan types..." columns={[
        { key: 'id', header: '#', width: 'w-16' }, { key: 'name', header: 'Loan Type' }, { key: 'description', header: 'Description' },
        { key: 'actions', header: 'Actions', sortable: false, accessor: (row) => (
          <div className="flex gap-2">
            <button onClick={() => openEdit(row)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 cursor-pointer"><Pencil size={13} /></button>
            <button onClick={() => remove(row.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
          </div>
        )}
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Loan Type' : 'Add Loan Type'} size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Loan Type Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Flat Rate" required />
          <Input label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export function BankPage() {
  const { banks, addBank, updateBank, deleteBank } = useStore()
  const { showToast } = useUIStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null)
  const [name, setName] = useState('')

  const openAdd = () => { setEditing(null); setName(''); setOpen(true) }
  const openEdit = (b: { id: number; name: string }) => { setEditing(b); setName(b.name); setOpen(true) }
  const save = () => {
    if (!name.trim()) return
    if (editing) { updateBank(editing.id, { name }); showToast('Bank updated successfully', 'success') }
    else { addBank({ name }); showToast('Bank added successfully', 'success') }
    setOpen(false)
  }
  const remove = (id: number) => { deleteBank(id); showToast('Bank deleted', 'warning') }

  return (
    <>
      <PageHeader title="Banks" action={{ label: 'Add Bank', onClick: openAdd, icon: <Plus size={13} /> }} />
      <DataTable data={banks} searchPlaceholder="Search banks..." columns={[
        { key: 'id', header: '#', width: 'w-16' }, { key: 'name', header: 'Bank Name' },
        { key: 'actions', header: 'Actions', sortable: false, accessor: (row) => (
          <div className="flex gap-2">
            <button onClick={() => openEdit(row)} className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 cursor-pointer"><Pencil size={13} /></button>
            <button onClick={() => remove(row.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
          </div>
        )}
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Bank' : 'Add Bank'} size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Bank Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. State Bank of India" required />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
