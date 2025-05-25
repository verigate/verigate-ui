"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// 로그인 폼 스키마
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "이메일을 입력해주세요." })
    .email({ message: "유효한 이메일 주소를 입력해주세요." }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  // useSearchParams()는 이제 loading.tsx가 있으므로 안전하게 사용 가능
  const searchParams = useSearchParams()
  const router = useRouter()
  const [success, setSuccess] = useState("")
  const { user, login, isLoginLoading, loginError, isAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // 이미 인증된 사용자는 대시보드로 리디렉션
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  // 회원가입 성공 메시지 처리
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("계정이 성공적으로 생성되었습니다! 로그인해주세요.")
    }
    if (searchParams.get("session_expired") === "true") {
      setSuccess("세션이 만료되었습니다. 다시 로그인해주세요.")
    }
  }, [searchParams])

  const onSubmit = (data: LoginFormValues) => {
    login(data)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-700 opacity-20 z-0"></div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold">
              VeriGate<span className="text-xs align-top">™</span>
            </span>
          </Link>

          <div className="mt-24">
            <h1 className="text-4xl font-bold mb-6">환영합니다</h1>
            <p className="text-lg opacity-90 mb-8">VeriGate 계정에 로그인하여 인증 및 액세스 제어 설정을 관리하세요.</p>

            <div className="space-y-6 mt-12">
              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">안전한 인증</h3>
                  <p className="opacity-80 text-sm">귀하의 데이터는 업계 표준 암호화로 보호됩니다</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">중앙 집중식 관리</h3>
                  <p className="opacity-80 text-sm">단일 대시보드에서 모든 OAuth 클라이언트를 제어하세요</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm opacity-80">VeriGate™ © 2024. All rights reserved.</div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6">
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <Shield className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold">
            VeriGate<span className="text-xs align-top">™</span>
          </span>
        </Link>

        <Card className="w-full max-w-lg border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            <CardDescription>계정에 접근하려면 자격 증명을 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {loginError instanceof Error
                    ? loginError.message
                    : typeof loginError === "object" && loginError !== null && "message" in loginError
                      ? (loginError as any).message
                      : "이메일 또는 비밀번호가 올바르지 않습니다"}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">비밀번호</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={`h-11 ${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isLoginLoading}
              >
                {isLoginLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>로그인 중...</span>
                  </div>
                ) : (
                  "로그인"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <div className="text-sm text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/register" className="text-emerald-600 hover:underline font-medium">
                계정 만들기
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
