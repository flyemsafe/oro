'use client'

import { ThemeToggle } from './ThemeToggle'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/button'
import { Bell, Plus } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search prompts..."
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <Button className="bg-oro-orange-500 hover:bg-oro-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Prompt
          </Button>
        </div>
      </div>
    </header>
  )
}
