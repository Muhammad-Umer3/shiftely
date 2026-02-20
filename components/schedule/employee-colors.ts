/**
 * Distinct colors for employee shift cards (background + text contrast).
 * Each employee gets a consistent color based on their ID.
 */
const EMPLOYEE_COLORS = [
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-white' },
  { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-white' },
  { bg: 'bg-violet-500', hover: 'hover:bg-violet-600', text: 'text-white' },
  { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-white' },
  { bg: 'bg-rose-500', hover: 'hover:bg-rose-600', text: 'text-white' },
  { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', text: 'text-white' },
  { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', text: 'text-white' },
  { bg: 'bg-teal-500', hover: 'hover:bg-teal-600', text: 'text-white' },
  { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-white' },
  { bg: 'bg-fuchsia-500', hover: 'hover:bg-fuchsia-600', text: 'text-white' },
  { bg: 'bg-lime-600', hover: 'hover:bg-lime-700', text: 'text-white' },
  { bg: 'bg-sky-500', hover: 'hover:bg-sky-600', text: 'text-white' },
] as const

const UNASSIGNED_COLOR = { bg: 'bg-stone-400', hover: 'hover:bg-stone-500', text: 'text-white' }

function hashEmployeeId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function getEmployeeColor(employeeId: string | null): (typeof EMPLOYEE_COLORS)[number] | typeof UNASSIGNED_COLOR {
  if (!employeeId) return UNASSIGNED_COLOR
  const index = hashEmployeeId(employeeId) % EMPLOYEE_COLORS.length
  return EMPLOYEE_COLORS[index]
}

export function getEmployeeColorClasses(employeeId: string | null): string {
  const color = getEmployeeColor(employeeId)
  return `${color.bg} ${color.text} ${color.hover}`
}
