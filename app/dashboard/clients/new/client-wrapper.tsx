"use client"

import type React from "react"

import { Suspense, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

// 로딩 컴포넌트
const LoadingComponent = () => (
  <div className="container flex min-h-[70vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      <p className="text-lg text-muted-foreground">클라이언트 생성 페이지를 불러오는 중...</p>
    </div>
  </div>
)

export default function ClientWrapper() {
  // 클라이언트 사이드에서만 NewClientForm을 임포트합니다
  const [ClientForm, setClientForm] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    // 클라이언트 사이드에서만 실행됩니다
    import("./new-client-form").then((module) => {
      setClientForm(() => module.default)
    })
  }, [])

  // 아직 컴포넌트가 로드되지 않았다면 로딩 상태를 표시합니다
  if (!ClientForm) {
    return <LoadingComponent />
  }

  // 컴포넌트가 로드되면 Suspense 경계 내에서 렌더링합니다
  return (
    <Suspense fallback={<LoadingComponent />}>
      <ClientForm />
    </Suspense>
  )
}
