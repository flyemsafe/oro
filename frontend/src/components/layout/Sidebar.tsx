'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, FileText, Tag, Star, Settings } from 'lucide-react'
import { Logo, LogoIcon } from '@/components/ui/Logo'

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Prompts',
    href: '/prompts',
    icon: FileText,
  },
  {
    title: 'Tags',
    href: '/tags',
    icon: Tag,
  },
  {
    title: 'Favorites',
    href: '/favorites',
    icon: Star,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full">
      {/* Logo Section */}
      <div className="px-6 py-6 border-b">
        <Link href="/" className="flex items-center gap-3 group">
          <LogoIcon size={32} className="transition-transform group-hover:scale-110" />
          <Logo size="lg" className="hidden sm:block" />
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-3 py-6">
        <div className="space-y-1">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent group',
                  isActive
                    ? 'bg-oro-orange-50 dark:bg-oro-orange-900/20 text-oro-orange-600 dark:text-oro-orange-400'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 transition-colors',
                  isActive && 'text-oro-orange-500'
                )} />
                {item.title}
                {isActive && (
                  <div className="ml-auto w-1 h-5 rounded-full bg-oro-orange-500" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-3 py-4 border-t">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent',
            pathname === '/settings'
              ? 'bg-oro-orange-50 dark:bg-oro-orange-900/20 text-oro-orange-600 dark:text-oro-orange-400'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  )
}
