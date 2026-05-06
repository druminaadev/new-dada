import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser { id: number; name: string; role: string; branchId: number }
interface AuthStore {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const DEMO_USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin', branchId: 1 },
  { id: 2, username: 'employee', password: 'emp123', name: 'Jhanvi Patel', role: 'employee', branchId: 1 },
  { id: 3, username: 'approver', password: 'apr123', name: 'Ravi Sharma', role: 'approver', branchId: 1 },
]

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (username, password) => {
        const found = DEMO_USERS.find(u => u.username === username && u.password === password)
        if (found) {
          const { password: _, username: __, ...user } = found
          set({ user, isAuthenticated: true })
          return true
        }
        return false
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'dada-auth' }
  )
)
