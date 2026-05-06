// Central dummy data store — all modules read/write here
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, addMonths, format } from 'date-fns'

export interface State { id: number; name: string }
export interface City { id: number; stateId: number; name: string }
export interface Area { id: number; cityId: number; name: string }
export interface Branch { id: number; name: string; address: string }
export interface Bank { id: number; name: string }
export interface LoanType { id: number; name: string; description: string }

export interface EMIInstalment {
  id: number; loanId: number; instNo: number; dueDate: string
  emiAmount: number; principal: number; interest: number; outstanding: number
  status: 'upcoming' | 'paid' | 'paid_late' | 'overdue'
  paidDate?: string; paidAmount?: number; paymentMode?: string; collectedBy?: number
  penaltyAmount?: number
}

export interface CivilScoreEvent {
  date: string; change: number; reason: string; score: number
}

export interface Employee {
  id: number; name: string; code: string; branchId: number
  contact: string; role: string; email: string
}

export interface CustomerBank {
  accountNo: string; holderName: string; bankName: string
  bankBranch: string; ifsc: string; documentUrl: string
}

export interface Nominee {
  identityProof: string; identityNo: string; name: string; relation: string
  dob: string; age: number; mobile: string; address: string
  photoUrl: string; accountNo: string; holderName: string
  bankName: string; bankBranch: string; ifsc: string; documentUrl: string
}

export interface Guarantor extends Nominee { slot: 1 | 2 }

export interface Customer {
  id: number; appNo: string; name: string; fatherName: string; motherName: string
  dob: string; age: number; gender: string; maritalStatus: string; bloodGroup: string
  occupation: string; regDate: string; mobile: string; altMobile: string
  email: string; aadhar: string; pan: string; jobAddress: string
  stateId: number; cityId: number; areaId: number; branchId: number
  employeeId: number; photoUrl: string; bank: CustomerBank
  nominee: Nominee | null; guarantor1: Guarantor | null; guarantor2: Guarantor | null
}

export interface SecurityDeposit {
  type: 'vehicle' | 'gold'
  modelName?: string; regNo?: string; chassisNo?: string; keys?: string; rcReceived?: boolean
  itemName?: string; weight?: number; pieces?: number; fileUrls: string[]
}

export interface LoanReceiver { mobile: string; documentUrl: string }

export interface Loan {
  id: number; loanNo: string; customerId: number; employeeId: number
  loanDate: string; emiStartDate: string; loanTypeId: number
  amount: number; installments: number; interestRate: number
  interestAmount: number; fileCharges: number; otherCharges: number
  intervalDays: string; remarks: string
  status: 'pending' | 'approved' | 'disbursed'
  security: SecurityDeposit; receiver: LoanReceiver
}

interface AppStore {
  // Master
  states: State[]; cities: City[]; areas: Area[]
  branches: Branch[]; banks: Bank[]; loanTypes: LoanType[]
  // Entities
  employees: Employee[]; customers: Customer[]; loans: Loan[]
  emis: EMIInstalment[]
  civilScores: Record<number, { score: number; history: CivilScoreEvent[] }>
  // Master CRUD
  addState: (s: Omit<State, 'id'>) => void
  updateState: (id: number, s: Partial<State>) => void
  deleteState: (id: number) => void
  addCity: (c: Omit<City, 'id'>) => void
  updateCity: (id: number, c: Partial<City>) => void
  deleteCity: (id: number) => void
  addArea: (a: Omit<Area, 'id'>) => void
  updateArea: (id: number, a: Partial<Area>) => void
  deleteArea: (id: number) => void
  addBranch: (b: Omit<Branch, 'id'>) => void
  updateBranch: (id: number, b: Partial<Branch>) => void
  deleteBranch: (id: number) => void
  addBank: (b: Omit<Bank, 'id'>) => void
  updateBank: (id: number, b: Partial<Bank>) => void
  deleteBank: (id: number) => void
  addLoanType: (lt: Omit<LoanType, 'id'>) => void
  updateLoanType: (id: number, lt: Partial<LoanType>) => void
  deleteLoanType: (id: number) => void
  // Employee CRUD
  addEmployee: (e: Omit<Employee, 'id'>) => void
  updateEmployee: (id: number, e: Partial<Employee>) => void
  deleteEmployee: (id: number) => void
  // Customer CRUD
  addCustomer: (c: Omit<Customer, 'id' | 'appNo'>) => void
  updateCustomer: (id: number, c: Partial<Customer>) => void
  deleteCustomer: (id: number) => void
  updateNominee: (customerId: number, n: Nominee) => void
  updateGuarantor: (customerId: number, slot: 1 | 2, g: Guarantor) => void
  // Loan CRUD
  addLoan: (l: Omit<Loan, 'id' | 'loanNo' | 'status'>) => void
  updateLoan: (id: number, l: Partial<Loan>) => void
  deleteLoan: (id: number) => void
  approveLoan: (id: number) => void
  disburseLoan: (id: number) => void
  // EMI
  generateEMIs: (loanId: number) => void
  collectEMI: (emiId: number, paidAmount: number, paymentMode: string, collectedBy: number, paidDate: string) => void
  // Civil Score
  applyScoreEvent: (customerId: number, change: number, reason: string) => void
}

const nextId = (arr: { id: number }[]) =>
  arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1

function buildEMISchedule(loan: Loan): Omit<EMIInstalment, 'id'>[] {
  const { id: loanId, amount, installments, interestRate, emiStartDate, intervalDays, loanTypeId } = loan
  const today = new Date().toISOString().split('T')[0]
  const isReducing = loanTypeId === 2
  const intervalNum = intervalDays === '7 Days' ? 7 : intervalDays === '14 Days' ? 14 : intervalDays === 'Quarterly' ? 90 : 30
  const isMonthly = intervalDays === 'Monthly' || intervalDays === 'Quarterly'
  const schedule: Omit<EMIInstalment, 'id'>[] = []
  let outstanding = amount
  const monthlyRate = interestRate / 100 / 12

  for (let i = 1; i <= installments; i++) {
    let dueDate: string
    if (isMonthly) {
      dueDate = format(addMonths(new Date(emiStartDate), i - 1), 'yyyy-MM-dd')
    } else {
      dueDate = format(addDays(new Date(emiStartDate), (i - 1) * intervalNum), 'yyyy-MM-dd')
    }
    let interest: number, principal: number, emiAmount: number
    if (isReducing) {
      interest = Math.round(outstanding * monthlyRate)
      const totalEMI = Math.round(amount * monthlyRate * Math.pow(1 + monthlyRate, installments) / (Math.pow(1 + monthlyRate, installments) - 1))
      principal = totalEMI - interest
      emiAmount = totalEMI
      outstanding = Math.max(0, outstanding - principal)
    } else {
      const totalInterest = amount * (interestRate / 100) * (installments / 12)
      emiAmount = Math.round((amount + totalInterest) / installments)
      principal = Math.round(amount / installments)
      interest = emiAmount - principal
      outstanding = Math.max(0, outstanding - principal)
    }
    const status: EMIInstalment['status'] = dueDate < today ? 'overdue' : 'upcoming'
    schedule.push({ loanId, instNo: i, dueDate, emiAmount, principal, interest, outstanding, status })
  }
  return schedule
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      states: [
        { id: 1, name: 'Gujarat' }, { id: 2, name: 'Maharashtra' },
        { id: 3, name: 'Rajasthan' }, { id: 4, name: 'Delhi' },
        { id: 5, name: 'Karnataka' },
      ],
      cities: [
        { id: 1, stateId: 1, name: 'Ahmedabad' }, { id: 2, stateId: 1, name: 'Surat' },
        { id: 3, stateId: 1, name: 'Vadodara' }, { id: 4, stateId: 2, name: 'Mumbai' },
        { id: 5, stateId: 2, name: 'Pune' }, { id: 6, stateId: 3, name: 'Jaipur' },
        { id: 7, stateId: 4, name: 'New Delhi' }, { id: 8, stateId: 5, name: 'Bengaluru' },
      ],
      areas: [
        { id: 1, cityId: 1, name: 'Navrangpura' }, { id: 2, cityId: 1, name: 'Satellite' },
        { id: 3, cityId: 1, name: 'Bopal' }, { id: 4, cityId: 2, name: 'Adajan' },
        { id: 5, cityId: 2, name: 'Vesu' }, { id: 6, cityId: 4, name: 'Andheri' },
        { id: 7, cityId: 4, name: 'Bandra' }, { id: 8, cityId: 5, name: 'Kothrud' },
      ],
      branches: [
        { id: 1, name: 'Ahmedabad Main', address: '12, CG Road, Ahmedabad' },
        { id: 2, name: 'Surat Branch', address: '45, Ring Road, Surat' },
        { id: 3, name: 'Mumbai Branch', address: '78, Andheri West, Mumbai' },
        { id: 4, name: 'Jaipur Branch', address: '23, MI Road, Jaipur' },
      ],
      banks: [
        { id: 1, name: 'State Bank of India' }, { id: 2, name: 'HDFC Bank' },
        { id: 3, name: 'ICICI Bank' }, { id: 4, name: 'Axis Bank' },
        { id: 5, name: 'Bank of Baroda' }, { id: 6, name: 'Punjab National Bank' },
        { id: 7, name: 'Kotak Mahindra Bank' }, { id: 8, name: 'Union Bank of India' },
      ],
      loanTypes: [
        { id: 1, name: 'Flat Rate', description: 'Interest on original principal throughout tenure' },
        { id: 2, name: 'Reducing Balance', description: 'Interest on outstanding principal' },
        { id: 3, name: 'Gold Loan', description: 'Loan against gold collateral' },
        { id: 4, name: 'Vehicle Loan', description: 'Loan against vehicle collateral' },
      ],
      employees: [
        { id: 1, name: 'Jhanvi Patel', code: 'EMP001', branchId: 1, contact: '9876543210', role: 'Loan Officer', email: 'jhanvi@dadafinance.com' },
        { id: 2, name: 'Ravi Sharma', code: 'EMP002', branchId: 1, contact: '9876543211', role: 'Senior Officer', email: 'ravi@dadafinance.com' },
        { id: 3, name: 'Priya Mehta', code: 'EMP003', branchId: 2, contact: '9876543212', role: 'Loan Officer', email: 'priya@dadafinance.com' },
        { id: 4, name: 'Amit Kumar', code: 'EMP004', branchId: 3, contact: '9876543213', role: 'Branch Manager', email: 'amit@dadafinance.com' },
        { id: 5, name: 'Sunita Verma', code: 'EMP005', branchId: 2, contact: '9876543214', role: 'Loan Officer', email: 'sunita@dadafinance.com' },
      ],
      customers: [
        {
          id: 1, appNo: 'APP1001', name: 'Ramesh Patel', fatherName: 'Suresh Patel', motherName: 'Kamla Patel',
          dob: '1985-06-15', age: 39, gender: 'male', maritalStatus: 'married', bloodGroup: 'B+',
          occupation: 'Businessman', regDate: '2025-01-10', mobile: '9876501001', altMobile: '9876501002',
          email: 'ramesh.patel@email.com', aadhar: '123456789012', pan: 'ABCDE1234F',
          jobAddress: '45 Market Road, Ahmedabad', stateId: 1, cityId: 1, areaId: 1, branchId: 1, employeeId: 1,
          photoUrl: '', bank: { accountNo: '10234567890', holderName: 'Ramesh Patel', bankName: 'SBI', bankBranch: 'Navrangpura', ifsc: 'SBIN0001234', documentUrl: '' },
          nominee: { identityProof: 'Aadhar Card', identityNo: '234567890123', name: 'Sunita Patel', relation: 'Spouse', dob: '1988-03-20', age: 36, mobile: '9876501003', address: '45 Market Road, Ahmedabad', photoUrl: '', accountNo: '20234567890', holderName: 'Sunita Patel', bankName: 'HDFC Bank', bankBranch: 'Navrangpura', ifsc: 'HDFC0001234', documentUrl: '' },
          guarantor1: { slot: 1, identityProof: 'Aadhar Card', identityNo: '345678901234', name: 'Mahesh Patel', relation: 'Brother', dob: '1982-09-10', age: 42, mobile: '9876501004', address: '12 Gandhi Nagar, Ahmedabad', photoUrl: '', accountNo: '30234567890', holderName: 'Mahesh Patel', bankName: 'ICICI Bank', bankBranch: 'Satellite', ifsc: 'ICIC0001234', documentUrl: '' },
          guarantor2: null,
        },
        {
          id: 2, appNo: 'APP1002', name: 'Priya Shah', fatherName: 'Dinesh Shah', motherName: 'Rekha Shah',
          dob: '1990-11-22', age: 34, gender: 'female', maritalStatus: 'married', bloodGroup: 'A+',
          occupation: 'Teacher', regDate: '2025-01-15', mobile: '9876502001', altMobile: '',
          email: 'priya.shah@email.com', aadhar: '234567890123', pan: 'BCDEF2345G',
          jobAddress: 'City School, Surat', stateId: 1, cityId: 2, areaId: 4, branchId: 2, employeeId: 3,
          photoUrl: '', bank: { accountNo: '10345678901', holderName: 'Priya Shah', bankName: 'HDFC Bank', bankBranch: 'Adajan', ifsc: 'HDFC0002345', documentUrl: '' },
          nominee: null, guarantor1: null, guarantor2: null,
        },
        {
          id: 3, appNo: 'APP1003', name: 'Vijay Kumar', fatherName: 'Mohan Kumar', motherName: 'Lata Kumar',
          dob: '1978-04-05', age: 47, gender: 'male', maritalStatus: 'married', bloodGroup: 'O+',
          occupation: 'Farmer', regDate: '2025-02-01', mobile: '9876503001', altMobile: '9876503002',
          email: '', aadhar: '345678901234', pan: 'CDEFG3456H',
          jobAddress: 'Village Kadi, Mehsana', stateId: 1, cityId: 3, areaId: 3, branchId: 1, employeeId: 2,
          photoUrl: '', bank: { accountNo: '10456789012', holderName: 'Vijay Kumar', bankName: 'Bank of Baroda', bankBranch: 'Vadodara', ifsc: 'BARB0001234', documentUrl: '' },
          nominee: null, guarantor1: null, guarantor2: null,
        },
        {
          id: 4, appNo: 'APP1004', name: 'Anita Desai', fatherName: 'Ramesh Desai', motherName: 'Usha Desai',
          dob: '1992-08-18', age: 32, gender: 'female', maritalStatus: 'unmarried', bloodGroup: 'AB+',
          occupation: 'Software Engineer', regDate: '2025-02-10', mobile: '9876504001', altMobile: '',
          email: 'anita.desai@email.com', aadhar: '456789012345', pan: 'DEFGH4567I',
          jobAddress: 'Tech Park, Mumbai', stateId: 2, cityId: 4, areaId: 6, branchId: 3, employeeId: 4,
          photoUrl: '', bank: { accountNo: '10567890123', holderName: 'Anita Desai', bankName: 'Axis Bank', bankBranch: 'Andheri', ifsc: 'UTIB0001234', documentUrl: '' },
          nominee: null, guarantor1: null, guarantor2: null,
        },
        {
          id: 5, appNo: 'APP1005', name: 'Suresh Joshi', fatherName: 'Prakash Joshi', motherName: 'Meena Joshi',
          dob: '1975-12-30', age: 49, gender: 'male', maritalStatus: 'married', bloodGroup: 'B-',
          occupation: 'Shop Owner', regDate: '2025-03-05', mobile: '9876505001', altMobile: '9876505002',
          email: 'suresh.joshi@email.com', aadhar: '567890123456', pan: 'EFGHI5678J',
          jobAddress: 'Main Bazaar, Jaipur', stateId: 3, cityId: 6, areaId: 2, branchId: 4, employeeId: 2,
          photoUrl: '', bank: { accountNo: '10678901234', holderName: 'Suresh Joshi', bankName: 'PNB', bankBranch: 'MI Road', ifsc: 'PUNB0001234', documentUrl: '' },
          nominee: null, guarantor1: null, guarantor2: null,
        },
      ],
      loans: [
        {
          id: 160, loanNo: 'LN160', customerId: 1, employeeId: 1, loanDate: '2025-01-15', emiStartDate: '2025-02-15',
          loanTypeId: 1, amount: 100000, installments: 12, interestRate: 12, interestAmount: 12000,
          fileCharges: 500, otherCharges: 200, intervalDays: 'Monthly', remarks: 'Regular customer',
          status: 'disbursed',
          security: { type: 'vehicle', modelName: 'Honda Activa', regNo: 'GJ01AB1234', chassisNo: 'ME4JF502XBT123456', keys: '2', rcReceived: true, fileUrls: [] },
          receiver: { mobile: '9876501001', documentUrl: '' },
        },
        {
          id: 161, loanNo: 'LN161', customerId: 2, employeeId: 3, loanDate: '2025-01-20', emiStartDate: '2025-02-20',
          loanTypeId: 3, amount: 50000, installments: 6, interestRate: 10, interestAmount: 2500,
          fileCharges: 300, otherCharges: 100, intervalDays: 'Monthly', remarks: 'Gold loan',
          status: 'approved',
          security: { type: 'gold', itemName: 'Gold Necklace', weight: 20, pieces: 1, fileUrls: [] },
          receiver: { mobile: '9876502001', documentUrl: '' },
        },
        {
          id: 162, loanNo: 'LN162', customerId: 3, employeeId: 2, loanDate: '2025-02-05', emiStartDate: '2025-03-05',
          loanTypeId: 1, amount: 75000, installments: 24, interestRate: 14, interestAmount: 17500,
          fileCharges: 400, otherCharges: 150, intervalDays: 'Monthly', remarks: 'Agricultural loan',
          status: 'pending',
          security: { type: 'vehicle', modelName: 'Bajaj Pulsar', regNo: 'GJ06CD5678', chassisNo: 'MD2A11CY9KCM12345', keys: '1', rcReceived: false, fileUrls: [] },
          receiver: { mobile: '9876503001', documentUrl: '' },
        },
        {
          id: 163, loanNo: 'LN163', customerId: 4, employeeId: 4, loanDate: '2025-02-12', emiStartDate: '2025-03-12',
          loanTypeId: 2, amount: 200000, installments: 36, interestRate: 11, interestAmount: 66000,
          fileCharges: 1000, otherCharges: 500, intervalDays: 'Monthly', remarks: 'Personal loan',
          status: 'disbursed',
          security: { type: 'gold', itemName: 'Gold Bangles', weight: 50, pieces: 4, fileUrls: [] },
          receiver: { mobile: '9876504001', documentUrl: '' },
        },
        {
          id: 164, loanNo: 'LN164', customerId: 5, employeeId: 2, loanDate: '2025-03-08', emiStartDate: '2025-04-08',
          loanTypeId: 4, amount: 150000, installments: 18, interestRate: 13, interestAmount: 29250,
          fileCharges: 750, otherCharges: 250, intervalDays: '7 Days', remarks: 'Vehicle loan',
          status: 'pending',
          security: { type: 'vehicle', modelName: 'Maruti Swift', regNo: 'RJ14EF9012', chassisNo: 'MA3FJEB1S00123456', keys: '2', rcReceived: true, fileUrls: [] },
          receiver: { mobile: '9876505001', documentUrl: '' },
        },
        {
          id: 165, loanNo: 'LN165', customerId: 1, employeeId: 1, loanDate: '2025-03-20', emiStartDate: '2025-04-20',
          loanTypeId: 1, amount: 80000, installments: 12, interestRate: 12, interestAmount: 9600,
          fileCharges: 400, otherCharges: 100, intervalDays: 'Monthly', remarks: 'Second loan',
          status: 'approved',
          security: { type: 'gold', itemName: 'Gold Ring', weight: 10, pieces: 2, fileUrls: [] },
          receiver: { mobile: '9876501001', documentUrl: '' },
        },
      ],

      emis: [],
      civilScores: {},

      // State CRUD
      addState: (s) => set(st => ({ states: [...st.states, { ...s, id: nextId(st.states) }] })),
      updateState: (id, s) => set(st => ({ states: st.states.map(x => x.id === id ? { ...x, ...s } : x) })),
      deleteState: (id) => set(st => ({ states: st.states.filter(x => x.id !== id) })),
      // City CRUD
      addCity: (c) => set(st => ({ cities: [...st.cities, { ...c, id: nextId(st.cities) }] })),
      updateCity: (id, c) => set(st => ({ cities: st.cities.map(x => x.id === id ? { ...x, ...c } : x) })),
      deleteCity: (id) => set(st => ({ cities: st.cities.filter(x => x.id !== id) })),
      // Area CRUD
      addArea: (a) => set(st => ({ areas: [...st.areas, { ...a, id: nextId(st.areas) }] })),
      updateArea: (id, a) => set(st => ({ areas: st.areas.map(x => x.id === id ? { ...x, ...a } : x) })),
      deleteArea: (id) => set(st => ({ areas: st.areas.filter(x => x.id !== id) })),
      // Branch CRUD
      addBranch: (b) => set(st => ({ branches: [...st.branches, { ...b, id: nextId(st.branches) }] })),
      updateBranch: (id, b) => set(st => ({ branches: st.branches.map(x => x.id === id ? { ...x, ...b } : x) })),
      deleteBranch: (id) => set(st => ({ branches: st.branches.filter(x => x.id !== id) })),
      // Bank CRUD
      addBank: (b) => set(st => ({ banks: [...st.banks, { ...b, id: nextId(st.banks) }] })),
      updateBank: (id, b) => set(st => ({ banks: st.banks.map(x => x.id === id ? { ...x, ...b } : x) })),
      deleteBank: (id) => set(st => ({ banks: st.banks.filter(x => x.id !== id) })),
      // LoanType CRUD
      addLoanType: (lt) => set(st => ({ loanTypes: [...st.loanTypes, { ...lt, id: nextId(st.loanTypes) }] })),
      updateLoanType: (id, lt) => set(st => ({ loanTypes: st.loanTypes.map(x => x.id === id ? { ...x, ...lt } : x) })),
      deleteLoanType: (id) => set(st => ({ loanTypes: st.loanTypes.filter(x => x.id !== id) })),
      // Employee CRUD
      addEmployee: (e) => set(st => ({ employees: [...st.employees, { ...e, id: nextId(st.employees) }] })),
      updateEmployee: (id, e) => set(st => ({ employees: st.employees.map(x => x.id === id ? { ...x, ...e } : x) })),
      deleteEmployee: (id) => set(st => ({ employees: st.employees.filter(x => x.id !== id) })),
      // Customer CRUD
      addCustomer: (c) => set(st => {
        const id = nextId(st.customers)
        const appNo = `APP${1000 + id}`
        return { customers: [...st.customers, { ...c, id, appNo }] }
      }),
      updateCustomer: (id, c) => set(st => ({ customers: st.customers.map(x => x.id === id ? { ...x, ...c } : x) })),
      deleteCustomer: (id) => set(st => ({ customers: st.customers.filter(x => x.id !== id) })),
      updateNominee: (customerId, n) => set(st => ({ customers: st.customers.map(x => x.id === customerId ? { ...x, nominee: n } : x) })),
      updateGuarantor: (customerId, slot, g) => set(st => ({
        customers: st.customers.map(x => x.id === customerId
          ? { ...x, [slot === 1 ? 'guarantor1' : 'guarantor2']: g } : x)
      })),
      // Loan CRUD
      addLoan: (l) => set(st => {
        const id = nextId(st.loans)
        return { loans: [...st.loans, { ...l, id, loanNo: `LN${id}`, status: 'pending' }] }
      }),
      updateLoan: (id, l) => set(st => ({ loans: st.loans.map(x => x.id === id ? { ...x, ...l } : x) })),
      deleteLoan: (id) => set(st => ({ loans: st.loans.filter(x => x.id !== id) })),
      approveLoan: (id) => set(st => ({ loans: st.loans.map(x => x.id === id ? { ...x, status: 'approved' } : x) })),
      disburseLoan: (id) => set(st => ({
        loans: st.loans.map(x => x.id === id ? { ...x, status: 'disbursed' } : x),
      })),
      generateEMIs: (loanId) => set(st => {
        const loan = st.loans.find(l => l.id === loanId)
        if (!loan) return {}
        const existing = st.emis.filter(e => e.loanId !== loanId)
        const newEmis = buildEMISchedule(loan)
        let nextEmiId = st.emis.length ? Math.max(...st.emis.map(e => e.id)) + 1 : 1
        const withIds = newEmis.map(e => ({ ...e, id: nextEmiId++ }))
        return { emis: [...existing, ...withIds] }
      }),
      collectEMI: (emiId, paidAmount, paymentMode, collectedBy, paidDate) => set(st => {
        const emi = st.emis.find(e => e.id === emiId)
        if (!emi) return {}
        const loan = st.loans.find(l => l.id === emi.loanId)
        const customer = loan ? st.customers.find(c => c.id === loan.customerId) : null
        const today = new Date().toISOString().split('T')[0]
        const daysLate = Math.max(0, Math.floor((new Date(paidDate).getTime() - new Date(emi.dueDate).getTime()) / 86400000))
        const status: EMIInstalment['status'] = daysLate === 0 ? 'paid' : 'paid_late'
        const penalty = daysLate > 7 ? Math.round(emi.emiAmount * 0.02) : daysLate > 0 ? Math.round(emi.emiAmount * 0.01) : 0
        const updatedEmis = st.emis.map(e => e.id === emiId ? { ...e, status, paidDate, paidAmount, paymentMode, collectedBy, penaltyAmount: penalty } : e)
        // Civil score update
        if (customer) {
          const existing = st.civilScores[customer.id] ?? { score: 700, history: [] }
          const change = daysLate === 0 ? 10 : daysLate <= 7 ? -5 : -10
          const reason = daysLate === 0 ? 'On-time EMI payment' : daysLate <= 7 ? 'Late payment (1-7 days)' : 'Very late payment (7+ days)'
          const newScore = Math.max(0, Math.min(900, existing.score + change))
          return {
            emis: updatedEmis,
            civilScores: {
              ...st.civilScores,
              [customer.id]: {
                score: newScore,
                history: [...existing.history, { date: today, change, reason, score: newScore }],
              },
            },
          }
        }
        return { emis: updatedEmis }
      }),
      applyScoreEvent: (customerId, change, reason) => set(st => {
        const existing = st.civilScores[customerId] ?? { score: 700, history: [] }
        const newScore = Math.max(0, Math.min(900, existing.score + change))
        const today = new Date().toISOString().split('T')[0]
        return {
          civilScores: {
            ...st.civilScores,
            [customerId]: {
              score: newScore,
              history: [...existing.history, { date: today, change, reason, score: newScore }],
            },
          },
        }
      }),
    }),
    { name: 'dada-lms-store' }
  )
)
