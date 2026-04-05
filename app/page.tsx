import { ChildSelector } from '@/components/ChildSelector'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <ChildSelector />
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <Link
          href="/login"
          className="text-sm text-white/20 hover:text-white/40 transition-colors"
        >
          Parent / Creator Login
        </Link>
      </div>
    </div>
  )
}
