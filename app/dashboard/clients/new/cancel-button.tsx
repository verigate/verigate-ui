"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function CancelButton() {
  const router = useRouter()

  return (
    <Button variant="outline" onClick={() => router.push("/dashboard/clients")} className="w-full sm:w-auto h-11">
      Cancel
    </Button>
  )
}
