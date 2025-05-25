import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"

// API 응답 타입 정의
export interface ApiResponse<T> {
  data: T
  status: number
  headers: Record<string, string>
}

// API 오류 타입 정의
export interface ApiError {
  error: string
  error_description: string
}

// API 클라이언트 클래스
class ApiClient {
  private client: AxiosInstance
  private baseUrl: string
  private refreshPromise: Promise<{ access_token: string; refresh_token: string; expires_at: string }> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30초 타임아웃
    })

    this.setupInterceptors()
  }

  // 인터셉터 설정
  private setupInterceptors(): void {
    // 요청 인터셉터
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

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // 토큰 만료 처리 (401 에러)
        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== "undefined") {
          // 로그인 페이지에서의 401은 자격 증명 오류이므로 토큰 갱신을 시도하지 않음
          if (originalRequest.url === "/api/v1/users/login") {
            return Promise.reject({
              message: "이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.",
              code: "invalid_credentials",
            })
          }

          // 토큰 갱신 로직
          const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

          if (refreshToken) {
            if (!this.refreshPromise) {
              this.refreshPromise = this.refreshAccessToken(refreshToken)
            }

            try {
              const tokens = await this.refreshPromise
              this.refreshPromise = null

              // 새 토큰으로 원래 요청 재시도
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`
              }
              originalRequest._retry = true
              return this.client(originalRequest)
            } catch (refreshError) {
              this.refreshPromise = null
              // 토큰 갱신 실패 시 로그아웃
              this.logout()
              return Promise.reject({
                message: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",
                code: "session_expired",
              })
            }
          } else {
            // 리프레시 토큰이 없으면 로그아웃
            this.logout()
            return Promise.reject({
              message: "로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.",
              code: "authentication_required",
            })
          }
        }

        // 네트워크 에러 처리
        if (!error.response) {
          // 인터넷 연결 확인
          if (!navigator.onLine) {
            return Promise.reject({
              message: "인터넷 연결이 끊어졌습니다. 네트워크 연결을 확인하고 다시 시도해주세요.",
              code: "network_offline",
            })
          }
          return Promise.reject({
            message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
            code: "network_error",
          })
        }

        // HTTP 상태 코드별 에러 처리
        if (error.response.status === 400) {
          return Promise.reject({
            message: "요청에 오류가 있습니다. 입력 정보를 확인해주세요.",
            code: "bad_request",
            status: error.response.status,
          })
        } else if (error.response.status === 403) {
          return Promise.reject({
            message: "이 작업을 수행할 권한이 없습니다.",
            code: "forbidden",
            status: error.response.status,
          })
        } else if (error.response.status === 404) {
          return Promise.reject({
            message: "요청한 리소스를 찾을 수 없습니다.",
            code: "not_found",
            status: error.response.status,
          })
        } else if (error.response.status === 409) {
          return Promise.reject({
            message: "요청이 현재 상태와 충돌합니다. 최신 정보로 다시 시도해주세요.",
            code: "conflict",
            status: error.response.status,
          })
        } else if (error.response.status === 429) {
          return Promise.reject({
            message: "너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.",
            code: "rate_limit",
            status: error.response.status,
          })
        } else if (error.response.status >= 500) {
          return Promise.reject({
            message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            code: "server_error",
            status: error.response.status,
          })
        }

        // API 에러 응답 처리
        if (error.response.data?.error) {
          return Promise.reject({
            message: error.response.data.error_description || "요청 처리 중 오류가 발생했습니다.",
            code: error.response.data.error,
            status: error.response.status,
          })
        }

        // 기타 에러 처리
        return Promise.reject({
          message: "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          code: "unknown_error",
          status: error.response?.status,
        })
      },
    )
  }

  // 토큰 갱신 메서드
  private async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string; expires_at: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/v1/users/refresh-token`, {
        refresh_token: refreshToken,
      })
      const { access_token, refresh_token, expires_at } = response.data

      // 새 토큰 저장
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

  // 로그아웃 메서드
  private logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("expires_at")
      window.location.href = "/login?session_expired=true"
    }
  }

  // GET 요청
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

  // POST 요청
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

  // PUT 요청
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

  // DELETE 요청
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

// API 클라이언트 인스턴스 생성
const apiClient = new ApiClient("https://verigate-api.injun.dev")

export default apiClient
