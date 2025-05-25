import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        <p className="text-lg text-muted-foreground">Loading client list...</p>
      </div>
    </div>
  )
}
