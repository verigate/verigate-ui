"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// 로딩 컴포넌트
const LoadingComponent = () => (
  <div className="container flex min-h-[70vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      <p className="text-lg text-muted-foreground">토큰 목록을 불러오는 중...</p>
    </div>
  </div>
)

// 클라이언트 컴포넌트를 동적으로 불러오고 SSR을 비활성화합니다
const TokensList = dynamic(() => import("./tokens-list"), {
  ssr: false,
  loading: () => <LoadingComponent />,
})

export default function ClientWrapper() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <TokensList />
    </Suspense>
  )
}
