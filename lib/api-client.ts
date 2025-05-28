import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"

// API response type definitions
export interface ApiResponse<T> {
  data: T
  status: number
  headers: Record<string, string>
}

// API error type definitions
export interface ApiError {
  error: string
  error_description: string
  details?: any
}

// API client class
class ApiClient {
  private client: AxiosInstance
  private baseUrl: string
  private refreshPromise: Promise<{ access_token: string; refresh_token: string; expires_at: string }> | null = null
  private isRefreshing: boolean = false

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    })

    this.setupInterceptors()
  }

  // Setup interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("auth_token")
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // Handle token expiration (401 error)
        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== "undefined") {
          // Don't attempt token refresh for login page 401s as they are credential errors
          if (originalRequest.url === "/api/v1/users/login") {
            return Promise.reject({
              message: "Incorrect email or password. Please check again.",
              code: "invalid_credentials",
            })
          }

          // Token refresh logic
          const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

          if (refreshToken) {
            // Check if we're already refreshing to prevent race conditions
            if (this.isRefreshing) {
              // Wait for ongoing refresh to complete
              if (this.refreshPromise) {
                try {
                  const tokens = await this.refreshPromise
                  // Retry original request with new token
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`
                  }
                  originalRequest._retry = true
                  return this.client(originalRequest)
                } catch (refreshError) {
                  this.logout()
                  return Promise.reject({
                    message: "Login session has expired. Please log in again.",
                    code: "session_expired",
                  })
                }
              }
            }

            // Start refresh process
            this.isRefreshing = true
            this.refreshPromise = this.refreshAccessToken(refreshToken)

            try {
              const tokens = await this.refreshPromise
              this.refreshPromise = null
              this.isRefreshing = false

              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`
              }
              originalRequest._retry = true
              return this.client(originalRequest)
            } catch (refreshError) {
              this.refreshPromise = null
              this.isRefreshing = false
              // Logout when token refresh fails
              this.logout()
              return Promise.reject({
                message: "Login session has expired. Please log in again.",
                code: "session_expired",
              })
            }
          } else {
            // Logout if no refresh token available
            this.logout()
            return Promise.reject({
              message: "Login is required for this service. Redirecting to login page.",
              code: "authentication_required",
            })
          }
        }

        // Handle network errors
        if (!error.response) {
          // Check internet connection
          if (!navigator.onLine) {
            return Promise.reject({
              message: "Internet connection is lost. Please check your network connection and try again.",
              code: "network_offline",
            })
          }
          return Promise.reject({
            message: "Cannot connect to server. Please try again later.",
            code: "network_error",
          })
        }

        // Handle HTTP status code errors
        if (error.response.status === 400) {
          return Promise.reject({
            message: "There is an error in the request. Please check your input information.",
            code: "bad_request",
            status: error.response.status,
          })
        } else if (error.response.status === 403) {
          return Promise.reject({
            message: "You do not have permission to perform this action.",
            code: "forbidden",
            status: error.response.status,
          })
        } else if (error.response.status === 404) {
          return Promise.reject({
            message: "The requested resource could not be found.",
            code: "not_found",
            status: error.response.status,
          })
        } else if (error.response.status === 409) {
          return Promise.reject({
            message: "The request conflicts with the current state. Please try again with the latest information.",
            code: "conflict",
            status: error.response.status,
          })
        } else if (error.response.status === 429) {
          return Promise.reject({
            message: "Too many requests sent. Please try again later.",
            code: "rate_limit",
            status: error.response.status,
          })
        } else if (error.response.status >= 500) {
          return Promise.reject({
            message: "A server error occurred. Please try again later.",
            code: "server_error",
            status: error.response.status,
          })
        }

        // Handle API error responses
        if (error.response.data?.error) {
          return Promise.reject({
            message: error.response.data.error_description || "An error occurred while processing the request.",
            code: error.response.data.error,
            status: error.response.status,
          })
        }

        // Handle other errors
        return Promise.reject({
          message: "An unknown error occurred. Please try again later.",
          code: "unknown_error",
          status: error.response?.status,
        })
      },
    )
  }

  // Token refresh method
  private async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string; expires_at: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/v1/users/refresh-token`, {
        refresh_token: refreshToken,
      })
      const { access_token, refresh_token, expires_at } = response.data

      // Store new tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", access_token)
        localStorage.setItem("refresh_token", refresh_token)
        localStorage.setItem("expires_at", expires_at)
      }

      return { access_token, refresh_token, expires_at }
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("expires_at")
      }
      throw error
    }
  }

  // Logout method
  private logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("expires_at")
      window.location.href = "/login?session_expired=true"
    }
  }

  // GET request
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config)
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      }
    } catch (error) {
      throw error
    }
  }

  // POST request
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config)
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      }
    } catch (error) {
      throw error
    }
  }

  // PUT request
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config)
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      }
    } catch (error) {
      throw error
    }
  }

  // DELETE request
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config)
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      }
    } catch (error) {
      throw error
    }
  }
}

// Create API client instance
const apiClient = new ApiClient("https://verigate-api.injun.dev")

export default apiClient
