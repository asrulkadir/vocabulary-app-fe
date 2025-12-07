import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showPassword?: boolean
  onTogglePassword?: () => void
}

export function PasswordInput({
  label,
  id,
  className = '',
  showPassword: controlledShowPassword,
  onTogglePassword,
  ...props
}: PasswordInputProps) {
  const [internalShowPassword, setInternalShowPassword] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const showPassword = controlledShowPassword ?? internalShowPassword
  const togglePassword = onTogglePassword ?? (() => setInternalShowPassword(!internalShowPassword))

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          className={`w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pr-12 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
