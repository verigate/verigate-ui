"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import AuthService, {
  type LoginRequest,
  type RegisterRequest,
  type User,
  type LoginResponse,
} from "@/lib/services/auth-service"
import { useToastContext } from "@/providers/toast-provider"
import { useEffect } from "react"

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToastContext()

  // 세션 만료 메시지 처리 (클라이언트 전용)
  useEffect(() => {
    if (typeof window !== "undefined" && searchParams.get("session_expired") === "true") {
      toast.addToast({
        title: "세션 만료",
        description: "보안을 위해 세션이 만료되었습니다. 다시 로그인해주세요.",
        type: "warning",
      })
    }
  }, [searchParams, toast])

  // 인증 상태 지속성 처리 (클라이언트 전용)
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = () => {
      const token = localStorage?.getItem("auth_token")
      if (!token) {
        queryClient.setQueryData(["currentUser"], null)
      } else {
        queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [queryClient])

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: AuthService.getCurrentUser,
    retry: false,
    enabled: typeof window !== "undefined" && !!localStorage?.getItem("auth_token"),
    staleTime: 1000 * 60 * 5, // 5분
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => AuthService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      queryClient.setQueryData(["currentUser"], data.user)
      toast.addToast({
        title: "로그인 성공",
        description: "환영합니다!",
        type: "success",
      })
      // 로그인 성공 시 대시보드로 자동 리디렉션
      router.push("/dashboard")
    },
    onError: (error: any) => {
      toast.addToast({
        title: "로그인 실패",
        description: error.message || "로그인 중 오류가 발생했습니다.",
        type: "error",
      })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => AuthService.register(userData),
    onSuccess: () => {
      toast.addToast({
        title: "회원가입 성공",
        description: "계정이 성공적으로 생성되었습니다. 로그인해주세요.",
        type: "success",
      })
      router.push("/login?registered=true")
    },
    onError: (error: any) => {
      let errorMessage = "회원가입 중 오류가 발생했습니다."

      // 에러 코드에 따른 사용자 친화적인 메시지
      if (error.code === "invalid_request") {
        errorMessage = "입력한 정보가 올바르지 않습니다. 다시 확인해주세요."
      } else if (error.code === "email_already_exists") {
        errorMessage = "이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요."
      } else if (error.code === "username_already_exists") {
        errorMessage = "이미 사용 중인 사용자 이름입니다. 다른 이름을 사용해주세요."
      }

      toast.addToast({
        title: "회원가입 실패",
        description: error.message || errorMessage,
        type: "error",
      })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<User>) => AuthService.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["currentUser"], updatedUser)
      toast.addToast({
        title: "프로필 업데이트 성공",
        description: "프로필이 성공적으로 업데이트되었습니다.",
        type: "success",
      })
    },
    onError: (error: any) => {
      toast.addToast({
        title: "프로필 업데이트 실패",
        description: error.message || "프로필 업데이트 중 오류가 발생했습니다.",
        type: "error",
      })
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      AuthService.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      toast.addToast({
        title: "비밀번호 변경 성공",
        description: "비밀번호가 성공적으로 변경되었습니다.",
        type: "success",
      })
    },
    onError: (error: any) => {
      let errorMessage = "비밀번호 변경 중 오류가 발생했습니다."

      // 에러 코드에 따른 사용자 친화적인 메시지
      if (error.code === "invalid_credentials") {
        errorMessage = "현재 비밀번호가 올바르지 않습니다."
      } else if (error.code === "weak_password") {
        errorMessage = "새 비밀번호가 보안 요구사항을 충족하지 않습니다."
      }

      toast.addToast({
        title: "비밀번호 변경 실패",
        description: error.message || errorMessage,
        type: "error",
      })
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: AuthService.deleteAccount,
    onSuccess: () => {
      AuthService.logout()
      queryClient.clear()
      toast.addToast({
        title: "계정 삭제 성공",
        description: "계정이 성공적으로 삭제되었습니다.",
        type: "success",
      })
      router.push("/login")
    },
    onError: (error: any) => {
      toast.addToast({
        title: "계정 삭제 실패",
        description: error.message || "계정 삭제 중 오류가 발생했습니다.",
        type: "error",
      })
    },
  })

  const logout = async () => {
    try {
      await AuthService.logout()
      queryClient.clear()
      toast.addToast({
        title: "로그아웃 성공",
        description: "성공적으로 로그아웃되었습니다.",
        type: "success",
      })
      router.push("/login")
    } catch (error: any) {
      toast.addToast({
        title: "로그아웃 실패",
        description: error.message || "로그아웃 중 오류가 발생했습니다.",
        type: "error",
      })
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && typeof window !== "undefined" && !!localStorage?.getItem("auth_token"),
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegisterLoading: registerMutation.isPending,
    registerError: registerMutation.error,
    updateProfile: updateProfileMutation.mutate,
    isUpdateProfileLoading: updateProfileMutation.isPending,
    updateProfileError: updateProfileMutation.error,
    changePassword: changePasswordMutation.mutate,
    isChangePasswordLoading: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,
    deleteAccount: deleteAccountMutation.mutate,
    isDeleteAccountLoading: deleteAccountMutation.isPending,
    deleteAccountError: deleteAccountMutation.error,
    logout,
    refetchUser: refetch,
  }
}
