interface Props {
  size?: number
  withLabel?: boolean
  className?: string
}

export default function Logo({ size = 32, withLabel = false, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/logo.svg" alt="Task Manager" width={size} height={size} style={{ width: size, height: size }} />
      {withLabel && (
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          Task<span className="text-indigo-600">Manager</span>
        </span>
      )}
    </div>
  )
}
