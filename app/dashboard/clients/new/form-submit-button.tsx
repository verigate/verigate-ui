"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface FormSubmitButtonProps {
  isPending: boolean
  onSuccess: boolean
}

export function FormSubmitButton({ isPending, onSuccess }: FormSubmitButtonProps) {
  const router = useRouter()

  useEffect(() => {
    if (onSuccess) {
      router.push("/dashboard/clients")
    }
  }, [onSuccess, router])

  return (
    <Button
      type="submit"
      form="new-client-form"
      disabled={isPending}
      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 h-11"
    >
      {isPending ? "Creating..." : "Create Client"}
    </Button>
  )
}
