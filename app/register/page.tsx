"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, AlertCircle, Loader2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAuth } from "@/hooks/use-auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// 회원가입 폼 스키마
const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: "사용자 이름을 입력해주세요." })
      .min(3, { message: "사용자 이름은 최소 3자 이상이어야 합니다." })
      .max(20, { message: "사용자 이름은 최대 20자까지 가능합니다." })
      .regex(/^[a-zA-Z0-9_]+$/, { message: "사용자 이름은 영문, 숫자, 밑줄(_)만 사용 가능합니다." }),
    email: z
      .string()
      .min(1, { message: "이메일을 입력해주세요." })
      .email({ message: "유효한 이메일 주소를 입력해주세요." }),
    full_name: z
      .string()
      .min(1, { message: "이름을 입력해주세요." })
      .max(50, { message: "이름은 최대 50자까지 가능합니다." }),
    password: z
      .string()
      .min(1, { message: "비밀번호를 입력해주세요." })
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." }),
    confirmPassword: z.string().min(1, { message: "비밀번호 확인을 입력해주세요." }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "서비스 이용약관에 동의해주세요.",
    }),
    acceptPrivacy: z.boolean().refine((val) => val === true, {
      message: "개인정보 처리방침에 동의해주세요.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  // useSearchParams()는 이제 loading.tsx가 있으므로 안전하게 사용 가능
  const searchParams = useSearchParams()
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "비밀번호를 입력하세요",
    color: "text-muted-foreground",
  })

  const { register: registerUser, isRegisterLoading, registerError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      full_name: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      acceptPrivacy: false,
    },
  })

  // 비밀번호 입력 감시
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "password") {
        checkPasswordStrength(value.password || "")
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        message: "비밀번호를 입력하세요",
        color: "text-muted-foreground",
      })
      return
    }

    let score = 0
    let message = ""
    let color = ""

    // 길이 검사
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1

    // 복잡성 검사
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    // 점수에 따른 메시지와 색상 설정
    if (score < 2) {
      message = "약함"
      color = "text-red-500"
    } else if (score < 4) {
      message = "보통"
      color = "text-amber-500"
    } else {
      message = "강함"
      color = "text-emerald-500"
    }

    setPasswordStrength({ score, message, color })
  }

  const onSubmit = (data: RegisterFormValues) => {
    registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
      full_name: data.full_name,
    })
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
            <h1 className="text-4xl font-bold mb-6">안전한 디지털 세계를 위한 VeriGate</h1>
            <p className="text-lg opacity-90 mb-8">
              수천 개의 조직이 인증 및 액세스 제어를 위해 VeriGate를 신뢰합니다.
            </p>

            <div className="space-y-6 mt-12">
              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">기업급 보안</h3>
                  <p className="opacity-80 text-sm">PKCE 지원을 통한 고급 OAuth 2.0 구현</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">원활한 통합</h3>
                  <p className="opacity-80 text-sm">기존 애플리케이션 및 서비스와 함께 작동</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">완벽한 제어</h3>
                  <p className="opacity-80 text-sm">단일 대시보드에서 사용자, 클라이언트 및 토큰 관리</p>
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
            <CardTitle className="text-2xl font-bold">계정 생성</CardTitle>
            <CardDescription>VeriGate에 가입하여 디지털 게이트웨이를 보호하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {registerError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {registerError instanceof Error
                    ? registerError.message
                    : typeof registerError === "object" && registerError !== null && "message" in registerError
                      ? (registerError as any).message
                      : "회원가입 중 오류가 발생했습니다."}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">이름</Label>
                  <Input
                    id="full_name"
                    placeholder="홍길동"
                    {...register("full_name")}
                    className={`h-11 ${errors.full_name ? "border-red-500" : ""}`}
                  />
                  {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">사용자 이름</Label>
                  <Input
                    id="username"
                    placeholder="gildong"
                    {...register("username")}
                    className={`h-11 ${errors.username ? "border-red-500" : ""}`}
                  />
                  {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
                </div>
              </div>

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
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={`h-11 ${errors.password ? "border-red-500" : ""}`}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <p className={`text-xs ${passwordStrength.color}`}>비밀번호 강도: {passwordStrength.message}</p>
                  <div className="flex h-1 flex-1 gap-1 mt-1 sm:mt-0">
                    {[1, 2, 3, 4, 5].map((segment) => (
                      <div
                        key={segment}
                        className={`h-full flex-1 rounded-full ${
                          segment <= passwordStrength.score
                            ? segment <= 2
                              ? "bg-red-500"
                              : segment <= 4
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className={`h-11 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptTerms"
                    {...register("acceptTerms")}
                    className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="acceptTerms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span className={errors.acceptTerms ? "text-red-500" : ""}>
                        <button
                          type="button"
                          onClick={() => document.getElementById("terms-accordion")?.click()}
                          className="text-emerald-600 hover:underline"
                        >
                          서비스 이용약관
                        </button>
                        에 동의합니다
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptPrivacy"
                    {...register("acceptPrivacy")}
                    className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="acceptPrivacy"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span className={errors.acceptPrivacy ? "text-red-500" : ""}>
                        <button
                          type="button"
                          onClick={() => document.getElementById("privacy-accordion")?.click()}
                          className="text-emerald-600 hover:underline"
                        >
                          개인정보 처리방침
                        </button>
                        에 동의합니다
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="terms">
                  <AccordionTrigger id="terms-accordion" className="text-sm">
                    서비스 이용약관
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground max-h-40 overflow-y-auto">
                    <p className="mb-2">
                      <strong>1. 약관 동의</strong>
                    </p>
                    <p className="mb-2">
                      VeriGate 서비스에 접근하거나 사용함으로써 귀하는 이 이용약관에 동의합니다. 이 약관에 동의하지 않는
                      경우 서비스를 사용할 수 없습니다.
                    </p>
                    <p className="mb-2">
                      <strong>2. 서비스 설명</strong>
                    </p>
                    <p className="mb-2">
                      VeriGate는 OAuth 2.0 인증 및 권한 부여 서비스를 제공합니다. 당사는 언제든지 서비스의 모든 측면을
                      수정하거나 중단할 권리를 보유합니다.
                    </p>
                    <p className="mb-2">
                      <strong>3. 사용자 계정</strong>
                    </p>
                    <p className="mb-2">
                      귀하는 계정 자격 증명의 기밀성을 유지하고 계정에서 발생하는 모든 활동에 대한 책임이 있습니다.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="privacy">
                  <AccordionTrigger id="privacy-accordion" className="text-sm">
                    개인정보 처리방침
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground max-h-40 overflow-y-auto">
                    <p className="mb-2">
                      <strong>1. 정보 수집</strong>
                    </p>
                    <p className="mb-2">
                      당사는 계정 생성, 서비스 사용 또는 당사와의 커뮤니케이션과 같이 귀하가 직접 제공하는 정보를
                      수집합니다.
                    </p>
                    <p className="mb-2">
                      <strong>2. 정보 사용</strong>
                    </p>
                    <p className="mb-2">
                      당사는 서비스 제공, 유지 및 개선, 트랜잭션 처리, 커뮤니케이션 전송, 보안 및 사기 방지를 위해
                      수집한 정보를 사용합니다.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isRegisterLoading}
              >
                {isRegisterLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>계정 생성 중...</span>
                  </div>
                ) : (
                  "계정 생성"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <div className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-emerald-600 hover:underline font-medium">
                로그인
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
