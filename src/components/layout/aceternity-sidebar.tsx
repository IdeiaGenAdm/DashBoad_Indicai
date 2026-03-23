'use client'
import React, { createContext, useContext, useState } from 'react'

import { usePathname } from 'next/navigation'

import { IconMenu2, IconX } from '@tabler/icons-react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface AceternitySidebarLink {
  label: string
  href: string
  icon: React.JSX.Element | React.ReactNode
}

interface SidebarContextProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  animate: boolean
  pinned: boolean
  setPinned: React.Dispatch<React.SetStateAction<boolean>>
  isExpanded: boolean
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export const useAceternitySidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useAceternitySidebar must be used within an AceternitySidebarProvider')
  }
  return context
}

export const AceternitySidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  const [openState, setOpenState] = useState(false)
  const [pinned, setPinned] = useState(true)

  const open = openProp !== undefined ? openProp : openState
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

  const isExpanded = pinned

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, pinned, setPinned, isExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const AceternitySidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  animate?: boolean
}) => {
  return (
    <AceternitySidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </AceternitySidebarProvider>
  )
}

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<'div'>)} />
    </>
  )
}

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { animate, isExpanded } = useAceternitySidebar()
  return (
    <>
      <motion.div
        className={cn(
          'hidden h-dvh shrink-0 overflow-hidden bg-neutral-100 px-3 py-4 md:flex md:flex-col dark:bg-neutral-800',
          className
        )}
        animate={{
          width: animate ? (isExpanded ? '260px' : '72px') : '260px',
        }}
        {...props}
      >
        {children}
      </motion.div>
    </>
  )
}

export const MobileSidebar = ({ className, children, ...props }: React.ComponentProps<'div'>) => {
  const { open, setOpen } = useAceternitySidebar()
  return (
    <>
      <div
        className={cn(
          'flex h-10 w-full flex-row items-center justify-between bg-neutral-100 px-4 py-4 md:hidden dark:bg-neutral-800'
        )}
        {...props}
      >
        <div className="z-20 flex w-full justify-end">
          <IconMenu2
            className="text-neutral-800 dark:text-neutral-200"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
              className={cn(
                'fixed inset-0 z-100 flex h-full w-full flex-col justify-between bg-white p-10 dark:bg-neutral-900',
                className
              )}
            >
              <div
                className="absolute top-10 right-10 z-50 text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}
              >
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export function SidebarToggle() {
  const { pinned, setPinned, isExpanded } = useAceternitySidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-foreground"
      onClick={() => setPinned(!pinned)}
      aria-label={isExpanded ? 'Recolher menu' : 'Expandir menu'}
    >
      {isExpanded ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
    </Button>
  )
}

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: AceternitySidebarLink
  className?: string
}) => {
  const pathname = usePathname()
  const { isExpanded, animate } = useAceternitySidebar()
  const isActive =
    pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'))
  const collapsed = animate && !isExpanded

  return (
    <a
      href={link.href}
      className={cn(
        'group/sidebar relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
        collapsed ? 'justify-center px-2 py-2.5' : 'justify-start px-3 py-2.5',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-neutral-400 hover:bg-primary/10 hover:text-primary dark:text-neutral-400 dark:hover:text-primary',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'shrink-0 transition-colors',
          collapsed &&
            !isActive &&
            'flex size-8 items-center justify-center rounded-md hover:bg-primary/10',
          isActive ? 'text-primary-foreground' : ''
        )}
      >
        {link.icon}
      </span>

      <motion.span
        animate={{
          display: animate ? (isExpanded ? 'inline-block' : 'none') : 'inline-block',
          opacity: animate ? (isExpanded ? 1 : 0) : 1,
        }}
        className={cn(
          'm-0! inline-block p-0! whitespace-pre transition-transform duration-150 group-hover/sidebar:translate-x-0.5',
          isActive
            ? 'font-semibold text-primary-foreground'
            : 'font-medium text-neutral-700 dark:text-neutral-200'
        )}
      >
        {link.label}
      </motion.span>
    </a>
  )
}
