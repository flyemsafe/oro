'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CopyButtonProps {
  text: string
  className?: string
  successMessage?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function CopyButton({
  text,
  className,
  successMessage = 'Copied to clipboard',
  variant = 'ghost',
  size = 'icon',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(successMessage)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
      console.error('Copy failed:', error)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn('transition-all', className)}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">
        {copied ? 'Copied' : 'Copy to clipboard'}
      </span>
    </Button>
  )
}
