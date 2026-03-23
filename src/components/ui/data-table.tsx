'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

/** Wrapper da Table shadcn com padrão visual: header amarelo, linhas alternadas neutro/amarelo, dark/light */
const DataTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-md border">
    <Table
      ref={ref}
      className={cn(
        '[&_thead]:bg-primary [&_thead]:text-primary-foreground [&_thead_th]:font-semibold',
        '[&_tbody_tr:nth-child(odd)]:bg-muted/50 [&_tbody_tr:nth-child(even)]:bg-primary/5 dark:[&_tbody_tr:nth-child(even)]:bg-primary/10',
        '[&_tbody_tr]:border-b [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-primary/10 dark:[&_tbody_tr:hover]:bg-primary/20',
        className
      )}
      {...props}
    />
  </div>
))
DataTable.displayName = 'DataTable'

const DataTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <TableHeader ref={ref} className={className} {...props} />
))
DataTableHeader.displayName = 'DataTableHeader'

const DataTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <TableBody ref={ref} className={className} {...props} />
))
DataTableBody.displayName = 'DataTableBody'

const DataTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <TableRow ref={ref} className={cn('border-primary/10', className)} {...props} />
))
DataTableRow.displayName = 'DataTableRow'

const DataTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableHead
    ref={ref}
    className={cn('h-12 px-4 text-left align-middle font-semibold text-primary-foreground [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
))
DataTableHead.displayName = 'DataTableHead'

const DataTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableCell ref={ref} className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
))
DataTableCell.displayName = 'DataTableCell'

export {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
}
