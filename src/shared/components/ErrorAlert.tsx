interface ErrorAlertProps {
  message: string
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  )
}
