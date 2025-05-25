import apiClient from "../api-client"

export interface Client {
  id: number
  client_id: string
  client_secret?: string
  client_name: string
  description?: string
  client_uri?: string
  logo_uri?: string
  redirect_uris: string[]
  grant_types: string[]
  response_types: string[]
  scope: string
  tos_uri?: string
  policy_uri?: string
  is_confidential: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClientCreateRequest {
  client_name: string
  description?: string
  client_uri?: string
  logo_uri?: string
  redirect_uris: string[]
  grant_types: string[]
  response_types?: string[]
  scope: string
  tos_uri?: string
  policy_uri?: string
  jwks_uri?: string
  jwks?: string
  contacts?: string[]
  software_id?: string
  software_version?: string
  is_confidential: boolean
}

export interface ClientsResponse {
  clients: Client[]
  total: number
  page: number
  per_page: number
}

const ClientService = {
  getClients: async (page = 1, limit = 10): Promise<ClientsResponse> => {
    try {
      const response = await apiClient.get("/api/v1/clients", {
        params: { page, limit },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching clients:", error)
      throw error
    }
  },

  getClient: async (id: number): Promise<Client> => {
    try {
      const response = await apiClient.get(`/api/v1/clients/${id}`)
      return response.data
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error("클라이언트를 찾을 수 없습니다.")
      }
      throw error
    }
  },

  createClient: async (data: ClientCreateRequest): Promise<Client> => {
    try {
      // 리다이렉트 URI가 배열이 아닌 문자열로 들어온 경우 처리
      if (typeof data.redirect_uris === "string") {
        data.redirect_uris = (data.redirect_uris as unknown as string)
          .split("\n")
          .map((uri) => uri.trim())
          .filter(Boolean)
      }

      const response = await apiClient.post("/api/v1/clients", data)
      return response.data
    } catch (error: any) {
      if (error.code === "validation_error") {
        if (error.message.includes("redirect_uri")) {
          throw new Error("유효하지 않은 리다이렉트 URI입니다. 올바른 URL 형식인지 확인해주세요.")
        } else if (error.message.includes("client_name")) {
          throw new Error("이미 사용 중인 클라이언트 이름입니다.")
        }
      }
      throw error
    }
  },

  updateClient: async (id: number, data: Partial<ClientCreateRequest>): Promise<void> => {
    try {
      // 리다이렉트 URI가 배열이 아닌 문자열로 들어온 경우 처리
      if (data.redirect_uris && typeof data.redirect_uris === "string") {
        data.redirect_uris = (data.redirect_uris as unknown as string)
          .split("\n")
          .map((uri) => uri.trim())
          .filter(Boolean)
      }

      await apiClient.put(`/api/v1/clients/${id}`, data)
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error("클라이언트를 찾을 수 없습니다.")
      } else if (error.code === "validation_error") {
        if (error.message.includes("redirect_uri")) {
          throw new Error("유효하지 않은 리다이렉트 URI입니다. 올바른 URL 형식인지 확인해주세요.")
        }
      }
      throw error
    }
  },

  deleteClient: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/clients/${id}`)
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error("클라이언트를 찾을 수 없습니다.")
      } else if (error.status === 409) {
        throw new Error("이 클라이언트는 현재 사용 중이므로 삭제할 수 없습니다.")
      }
      throw error
    }
  },
}

export default ClientService
