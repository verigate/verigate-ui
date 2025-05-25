"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/providers/toast-provider"
import { useState } from "react"

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              // 401 에러는 재시도하지 않음 (인증 문제)
              if (error?.status === 401) return false
              // 404 에러는 재시도하지 않음 (리소스 없음)
              if (error?.status === 404) return false
              // 최대 3번까지 재시도
              return failureCount < 3
            },
            staleTime: 1000 * 60 * 5, // 5분
            refetchOnWindowFocus: false,
            refetchOnMount: true,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
