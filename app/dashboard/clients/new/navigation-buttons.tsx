"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface NavigationButtonsProps {
  isPending: boolean
  isSuccess: boolean
}

export function NavigationButtons({ isPending, isSuccess }: NavigationButtonsProps) {
  const router = useRouter()

  // 성공 시 리다이렉션
  useEffect(() => {
    if (isSuccess) {
      router.push("/dashboard/clients")
    }
  }, [isSuccess, router])

  return (
    <>
      <Button variant="outline" onClick={() => router.push("/dashboard/clients")} className="w-full sm:w-auto h-11">
        Cancel
      </Button>
      <Button
        type="submit"
        form="new-client-form"
        disabled={isPending}
        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 h-11"
      >
        {isPending ? "Creating..." : "Create Client"}
      </Button>
    </>
  )
}
