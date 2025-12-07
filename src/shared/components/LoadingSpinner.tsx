interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'h-6 w-6',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-cyan-400 ${sizeStyles[size]}`} />
    </div>
  )
}
