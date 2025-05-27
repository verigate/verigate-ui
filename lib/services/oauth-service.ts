import apiClient from "../api-client"

export interface ConsentInfo {
  client_id: string
  client_name: string
  scope: string
  scope_list: string[]
  state?: string
}

export interface ConsentRequest {
  client_id: string
  scope: string
  consent: boolean
}

export interface ConsentResponse {
  redirect: string
}

const OAuthService = {
  getConsentInfo: async (
    clientId: string,
    scope: string,
    redirectUri: string,
    state?: string,
    codeChallenge?: string,
    codeChallengeMethod?: string,
  ): Promise<ConsentInfo> => {
    try {
      const params: Record<string, string> = {
        client_id: clientId,
        scope,
        redirect_uri: redirectUri,
      }

      if (state) {
        params.state = state
      }

      if (codeChallenge) {
        params.code_challenge = codeChallenge
      }

      if (codeChallengeMethod) {
        params.code_challenge_method = codeChallengeMethod
      }

      const response = await apiClient.get("/api/v1/oauth/consent", { params })
      return response.data as ConsentInfo
    } catch (error: any) {
      if (error.code === "invalid_client") {
        throw new Error("Invalid client.")
      } else if (error.code === "invalid_redirect_uri") {
        throw new Error("Invalid redirect URI.")
      } else if (error.code === "invalid_scope") {
        throw new Error("Invalid scope.")
      }
      throw error
    }
  },

  submitConsent: async (data: ConsentRequest): Promise<ConsentResponse> => {
    try {
      const response = await apiClient.post("/api/v1/oauth/consent", data)
      return response.data as ConsentResponse
    } catch (error) {
      console.error("Error submitting consent:", error)
      throw error
    }
  },
}

export default OAuthService
