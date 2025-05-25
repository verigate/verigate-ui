import apiClient from "../api-client"

export interface RegisterRequest {
  username: string
  email: string
  password: string
  full_name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_at: string
}

export interface User {
  id: number
  username: string
  email: string
  full_name: string
  profile_picture_url?: string
  phone_number?: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  last_login_at?: string
}

export interface PasswordChangeRequest {
  old_password: string
  new_password: string
}

const AuthService = {
  register: async (data: RegisterRequest): Promise<User> => {
    try {
      const response = await apiClient.post<User>("/api/v1/users/register", data)
      return response.data
    } catch (error: any) {
      if (error.code === "conflict") {
        if (error.message.includes("email")) {
          throw new Error("이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.")
        } else if (error.message.includes("username")) {
          throw new Error("이미 사용 중인 사용자 이름입니다. 다른 이름을 사용해주세요.")
        }
      }
      throw error
    }
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>("/api/v1/users/login", data)    // 토큰 저장
    if (typeof window !== "undefined") {
      if (response.data.access_token) {
        localStorage.setItem("auth_token", response.data.access_token)
      }
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token)
      }
      if (response.data.expires_at) {
        localStorage.setItem("expires_at", response.data.expires_at)
      }
    }

      return response.data
    } catch (error: any) {
      // 더 구체적인 에러 메시지 제공
      if (error.status === 401) {
        throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.")
      } else if (error.status === 429) {
        throw new Error("너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.")
      } else if (error.status === 403) {
        throw new Error("계정이 잠겼습니다. 관리자에게 문의하세요.")
      } else if (!navigator.onLine) {
        throw new Error("인터넷 연결을 확인해주세요.")
      }
      throw error
    }
  },

  logout: async (): Promise<void> => {
    try {
      // 서버에 로그아웃 요청 (토큰 무효화)
      await apiClient.post("/api/v1/users/logout")
    } catch (error) {
      console.error("Logout error:", error)
  } finally {
    // 로컬 스토리지에서 토큰 제거
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("expires_at")
    }
  }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>("/api/v1/users/me")
      return response.data
    } catch (error) {
      console.error("Error fetching current user:", error)
      throw error
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put<User>("/api/v1/users/me", data)
      return response.data
    } catch (error: any) {
      if (error.code === "validation_error") {
        throw new Error("입력한 정보가 유효하지 않습니다. 다시 확인해주세요.")
      }
      throw error
    }
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.put("/api/v1/users/me/password", {
        old_password: oldPassword,
        new_password: newPassword,
      })
    } catch (error: any) {
      if (error.code === "invalid_credentials") {
        throw new Error("현재 비밀번호가 올바르지 않습니다.")
      } else if (error.code === "validation_error") {
        throw new Error("새 비밀번호가 보안 요구사항을 충족하지 않습니다.")
      }
      throw error
    }
  },

  deleteAccount: async (): Promise<void> => {
  try {
    await apiClient.delete("/api/v1/users/me")
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("expires_at")
    }
  } catch (error) {
      console.error("Error deleting account:", error)
      throw error
    }
  },

  refreshToken: async (
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string; expires_at: string }> => {
    try {
      const response = await apiClient.post<{ access_token: string; refresh_token: string; expires_at: string }>(
        "/api/v1/users/refresh-token",
        {
          refresh_token: refreshToken,
        },
      )
      return response.data
    } catch (error) {
      console.error("Error refreshing token:", error)
      throw error
    }
  },
}

export default AuthService
