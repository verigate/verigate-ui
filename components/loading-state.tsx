import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  text?: string
  size?: "sm" | "md" | "lg"
  fullPage?: boolean
  className?: string
}

export function LoadingState({ text, size = "md", fullPage = false, className = "" }: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const containerClasses = fullPage
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex flex-col items-center justify-center p-8"

  return (
    <div className={`${containerClasses} ${className}`} aria-live="polite" role="status">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-emerald-600`} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}
