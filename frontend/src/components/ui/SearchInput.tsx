'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from './input'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
  onClear?: () => void
}

export function SearchInput({
  value: controlledValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  onClear,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || '')
  const [debouncedValue, setDebouncedValue] = useState(controlledValue || '')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(internalValue)
      onChange?.(internalValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [internalValue, debounceMs, onChange])

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue)
    }
  }, [controlledValue])

  const handleClear = () => {
    setInternalValue('')
    setDebouncedValue('')
    onChange?.('')
    onClear?.()
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {internalValue && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  )
}
