'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

interface NavItem {
  label: string
  href: string
  icon: string
}

const CREATE_ITEMS: NavItem[] = [
  { label: 'Story Builder', href: '/studio/stories/new', icon: 'S' },
  { label: 'Activity Designer', href: '/studio/activities/new', icon: 'A' },
  { label: 'Outfit Designer', href: '/studio/outfits/new', icon: 'O' },
]

const LEARN_ITEMS: NavItem[] = [
  { label: 'Writing Lab', href: '/studio/learn/writing', icon: 'W' },
  { label: 'Design Basics', href: '/studio/learn/design', icon: 'D' },
  { label: 'How Things Work', href: '/studio/learn/how-things-work', icon: 'H' },
]

const PUBLISHED_ITEMS: NavItem[] = [
  { label: 'Live for Siblings', href: '/studio?filter=published', icon: 'L' },
  { label: 'Awaiting Review', href: '/studio?filter=review', icon: 'R' },
]

function SidebarSection({
  title,
  items,
  pathname,
  searchFilter,
  onNavigate,
}: {
  title: string
  items: NavItem[]
  pathname: string
  searchFilter: string | null
  onNavigate: (href: string) => void
}) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href.includes('?filter=') &&
              pathname === '/studio' &&
              searchFilter === item.href.split('filter=')[1])
          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={`flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-500/15 text-green-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface StudioSidebarProps {
  onSignOut: () => void
  signingOut: boolean
}

export function StudioSidebar({ onSignOut, signingOut }: StudioSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchFilter = searchParams.get('filter')

  function navigate(href: string) {
    router.push(href)
  }

  return (
    <aside className="w-56 bg-slate-900/80 border-r border-slate-800 flex flex-col p-4 shrink-0">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-lg font-bold text-green-400 tracking-tight">
          Kylie&apos;s Lily Pad
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Creator Studio</p>
      </motion.div>

      {/* My Projects link */}
      <button
        onClick={() => navigate('/studio')}
        className={`flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-4 ${
          pathname === '/studio' && !searchFilter
            ? 'bg-green-500/15 text-green-400'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <span
          className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
            pathname === '/studio' && !searchFilter
              ? 'bg-green-500/20 text-green-400'
              : 'bg-slate-800 text-slate-500'
          }`}
        >
          P
        </span>
        My Projects
      </button>

      <nav className="flex flex-col flex-1 overflow-auto">
        <SidebarSection
          title="Create"
          items={CREATE_ITEMS}
          pathname={pathname}
          searchFilter={searchFilter}
          onNavigate={navigate}
        />
        <SidebarSection
          title="Learn"
          items={LEARN_ITEMS}
          pathname={pathname}
          searchFilter={searchFilter}
          onNavigate={navigate}
        />
        <SidebarSection
          title="Published"
          items={PUBLISHED_ITEMS}
          pathname={pathname}
          searchFilter={searchFilter}
          onNavigate={navigate}
        />
      </nav>

      <button
        onClick={onSignOut}
        disabled={signingOut}
        className="text-xs text-slate-500 hover:text-slate-300 transition-colors mt-4 text-left px-3 py-2"
      >
        {signingOut ? 'Signing out...' : 'Sign Out'}
      </button>
    </aside>
  )
}
