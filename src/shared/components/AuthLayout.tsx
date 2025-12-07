import { Link } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">Vocabulary App</h1>
        </div>

        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>}
            {subtitle && <p className="text-gray-400 mt-2">{subtitle}</p>}
          </div>
        )}

        {children}

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
