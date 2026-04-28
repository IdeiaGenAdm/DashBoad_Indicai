export interface ExportColumn<T> {
  label: string
  value: (row: T) => string | number | null | undefined
}

function normalizeCell(value: string | number | null | undefined): string {
  if (value == null) return ''
  return String(value)
}

function csvCell(value: string | number | null | undefined): string {
  const text = normalizeCell(value).replace(/"/g, '""')
  return `"${text}"`
}

function htmlCell(value: string | number | null | undefined): string {
  return normalizeCell(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 10)
}

export function exportRowsToCsv<T>(filename: string, columns: ExportColumn<T>[], rows: T[]) {
  const header = columns.map((column) => csvCell(column.label)).join(';')
  const body = rows.map((row) => columns.map((column) => csvCell(column.value(row))).join(';'))
  const csv = ['\ufeff' + header, ...body].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${timestamp()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function exportRowsToPdf<T>(title: string, columns: ExportColumn<T>[], rows: T[]) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return false

  const tableHead = columns.map((column) => `<th>${htmlCell(column.label)}</th>`).join('')
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${columns.map((column) => `<td>${htmlCell(column.value(row))}</td>`).join('')}</tr>`
    )
    .join('')

  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>${htmlCell(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111; margin: 24px; }
      h1 { font-size: 20px; margin: 0 0 16px; }
      table { border-collapse: collapse; width: 100%; font-size: 12px; }
      th, td { border: 1px solid #d4d4d4; padding: 8px; text-align: left; }
      th { background: #f2f2f2; font-weight: 700; }
      tr:nth-child(even) { background: #fafafa; }
      @media print { body { margin: 12mm; } }
    </style>
  </head>
  <body>
    <h1>${htmlCell(title)}</h1>
    <table>
      <thead><tr>${tableHead}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  </body>
</html>`)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  return true
}
