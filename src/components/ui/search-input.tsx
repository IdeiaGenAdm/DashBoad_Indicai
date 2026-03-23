'use client'

import { useEffect, useState } from 'react'

import { Search } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'

import { Input } from './input'

interface SearchInputProps {
  placeholder?: string
  className?: string
}

export function SearchInput({ placeholder = 'Pesquisar...', className }: SearchInputProps) {
  const [searchUrl, setSearchUrl] = useQueryState('q', parseAsString.withDefault(''))
  const [localSearch, setLocalSearch] = useState(searchUrl)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setLocalSearch(searchUrl)
    setIsPending(false)
  }, [searchUrl])

  useEffect(() => {
    if (localSearch === searchUrl) {
      setIsPending(false)
      return
    }

    setIsPending(true)
    const timer = setTimeout(() => {
      setSearchUrl(localSearch || null)
    }, 500)

    return () => clearTimeout(timer)
  }, [localSearch, searchUrl, setSearchUrl])

  return (
    <div className="relative flex-1">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className={`pl-9 ${className || ''}`}
      />
    </div>
  )
}
