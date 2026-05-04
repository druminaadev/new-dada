'use client'
type Status = 'pending' | 'approved' | 'disbursed'
const cfg: Record<Status, string> = {
  pending:   'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-700',
  approved:  'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-700',
  disbursed: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-700',
}
export function Badge({ status }: { status: Status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
