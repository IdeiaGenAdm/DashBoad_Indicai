import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata data como dia/mês/ano (DD/MM/YYYY) */
export function formatDateDMY(v: string | Date | null | undefined): string {
  if (v == null) return ''
  const d = typeof v === 'string' ? new Date(v) : v
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Converte data ISO ou Date para formato YYYY-MM-DD (input type="date") preservando o dia local */
export function formatDateForInput(v: string | Date | null | undefined): string {
  if (v == null) return ''
  const d = typeof v === 'string' ? new Date(v) : v
  if (Number.isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Converte string YYYY-MM-DD (input type="date") para ISO no início do dia (fuso local) */
export function dateInputToIsoStart(s: string): string | undefined {
  if (!s?.trim()) return undefined
  const [year, month, day] = s.split('-').map(Number)
  if (!year || !month || !day) return undefined
  const d = new Date(year, month - 1, day, 0, 0, 0, 0)
  return d.toISOString()
}

/** Converte string YYYY-MM-DD (input type="date") para ISO no fim do dia (fuso local) */
export function dateInputToIsoEnd(s: string): string | undefined {
  if (!s?.trim()) return undefined
  const [year, month, day] = s.split('-').map(Number)
  if (!year || !month || !day) return undefined
  const d = new Date(year, month - 1, day, 23, 59, 59, 999)
  return d.toISOString()
}
