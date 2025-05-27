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

  // Session expiry message handling (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined" && searchParams.get("session_expired") === "true") {
      toast.addToast({
        title: "Session Expired",
        description: "Your session has expired for security reasons. Please sign in again.",
        type: "warning",
      })
    }
  }, [searchParams, toast])

  // Authentication state persistence handling (client-side only)
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => AuthService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      queryClient.setQueryData(["currentUser"], data.user)
      toast.addToast({
        title: "Login Successful",
        description: "Welcome!",
        type: "success",
      })
      // Automatically redirect to dashboard on successful login
      router.push("/dashboard")
    },
    onError: (error: any) => {
      toast.addToast({
        title: "Login Failed",
        description: error.message || "An error occurred during login.",
        type: "error",
      })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => AuthService.register(userData),
    onSuccess: () => {
      toast.addToast({
        title: "Registration Successful",
        description: "Account created successfully. Please sign in.",
        type: "success",
      })
      router.push("/login?registered=true")
    },
    onError: (error: any) => {
      let errorMessage = "An error occurred during registration."

      // User-friendly messages based on error codes
      if (error.code === "invalid_request") {
        errorMessage = "The information you entered is incorrect. Please check and try again."
      } else if (error.code === "email_already_exists") {
        errorMessage = "This email is already in use. Please use a different email."
      } else if (error.code === "username_already_exists") {
        errorMessage = "This username is already in use. Please use a different username."
      }

      toast.addToast({
        title: "Registration Failed",
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
        title: "Profile Update Successful",
        description: "Profile updated successfully.",
        type: "success",
      })
    },
    onError: (error: any) => {
      toast.addToast({
        title: "Profile Update Failed",
        description: error.message || "An error occurred while updating profile.",
        type: "error",
      })
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      AuthService.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      toast.addToast({
        title: "Password Change Successful",
        description: "Password changed successfully.",
        type: "success",
      })
    },
    onError: (error: any) => {
      let errorMessage = "An error occurred while changing password."

      // User-friendly messages based on error codes
      if (error.code === "invalid_credentials") {
        errorMessage = "Current password is incorrect."
      } else if (error.code === "weak_password") {
        errorMessage = "New password does not meet security requirements."
      }

      toast.addToast({
        title: "Password Change Failed",
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
        title: "Account Deletion Successful",
        description: "Account deleted successfully.",
        type: "success",
      })
      router.push("/login")
    },
    onError: (error: any) => {
      toast.addToast({
        title: "Account Deletion Failed",
        description: error.message || "An error occurred while deleting account.",
        type: "error",
      })
    },
  })

  const logout = async () => {
    try {
      await AuthService.logout()
      queryClient.clear()
      toast.addToast({
        title: "Logout Successful",
        description: "Successfully logged out.",
        type: "success",
      })
      router.push("/login")
    } catch (error: any) {
      toast.addToast({
        title: "Logout Failed",
        description: error.message || "An error occurred during logout.",
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
