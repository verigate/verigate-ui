import apiClient from "../api-client"

export interface Token {
  id: string
  client_id: string
  user_id: number
  scope: string
  expires_at: string
  created_at: string
  is_revoked: boolean
}

export interface TokensResponse {
  tokens: Token[]
  total: number
  page: number
  per_page: number
}

const TokenService = {
  getTokens: async (page = 1, limit = 10): Promise<TokensResponse> => {
    try {
      const response = await apiClient.get("/api/v1/tokens", {
        params: { page, limit },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching tokens:", error)
      throw error
    }
  },

  revokeToken: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/tokens/${id}`)
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error("토큰을 찾을 수 없습니다.")
      } else if (error.code === "already_revoked") {
        throw new Error("이미 취소된 토큰입니다.")
      }
      throw error
    }
  },
}

export default TokenService
