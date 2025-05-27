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
          throw new Error("This email is already in use. Please use a different email.")
        } else if (error.message.includes("username")) {
          throw new Error("This username is already in use. Please use a different username.")
        }
      }
      throw error
    }
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>("/api/v1/users/login", data)    // Store tokens
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
      // Provide more specific error messages
      if (error.status === 401) {
        throw new Error("Incorrect email or password.")
      } else if (error.status === 429) {
        throw new Error("Too many login attempts. Please try again later.")
      } else if (error.status === 403) {
        throw new Error("Account is locked. Please contact an administrator.")
      } else if (!navigator.onLine) {
        throw new Error("Please check your internet connection.")
      }
      throw error
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Request logout from server (invalidate tokens)
      await apiClient.post("/api/v1/users/logout")
    } catch (error) {
      console.error("Logout error:", error)
  } finally {
    // Remove tokens from local storage
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
        throw new Error("The information entered is invalid. Please check again.")
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
        throw new Error("Current password is incorrect.")
      } else if (error.code === "validation_error") {
        throw new Error("New password does not meet security requirements.")
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
