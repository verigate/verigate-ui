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
      return response.data as ClientsResponse
    } catch (error) {
      console.error("Error fetching clients:", error)
      throw error
    }
  },

  getClient: async (id: number): Promise<Client> => {
    try {
      const response = await apiClient.get(`/api/v1/clients/${id}`)
      return response.data as Client
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error("Client not found.")
      }
      throw error
    }
  },

  createClient: async (data: ClientCreateRequest): Promise<Client> => {
    try {
      // Handle case where redirect URIs come as string instead of array
      if (typeof data.redirect_uris === "string") {
        data.redirect_uris = (data.redirect_uris as unknown as string)
          .split("\n")
          .map((uri) => uri.trim())
          .filter(Boolean)
      }

      const response = await apiClient.post("/api/v1/clients", data)
      return response.data as Client
    } catch (error: any) {
      if (error.code === "validation_error") {
        if (error.message.includes("redirect_uri")) {
          throw new Error("Invalid redirect URI. Please check that it's a valid URL format.")
        } else if (error.message.includes("client_name")) {
          throw new Error("Client name is already in use.")
        }
      }
      throw error
    }
  },

  updateClient: async (id: number, data: Partial<ClientCreateRequest>): Promise<void> => {
    try {
      // Handle case where redirect URIs come as string instead of array
      if (data.redirect_uris && typeof data.redirect_uris === "string") {
        data.redirect_uris = (data.redirect_uris as unknown as string)
          .split("\n")
          .map((uri) => uri.trim())
          .filter(Boolean)
      }

      await apiClient.put(`/api/v1/clients/${id}`, data)
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error("Client not found.")
      } else if (error.code === "validation_error") {
        if (error.message.includes("redirect_uri")) {
          throw new Error("Invalid redirect URI. Please check that it's a valid URL format.")
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
        throw new Error("Client not found.")
      } else if (error.status === 409) {
        throw new Error("This client is currently in use and cannot be deleted.")
      }
      throw error
    }
  },
}

export default ClientService
