"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import OAuthService, { type ConsentRequest } from "@/lib/services/oauth-service"
import { useToastContext } from "@/providers/toast-provider"
import { getErrorMessage } from "@/lib/errors"

export function useConsentInfo(
  clientId: string,
  scope: string,
  redirectUri: string,
  state?: string,
  codeChallenge?: string,
  codeChallengeMethod?: string,
) {
  const toast = useToastContext()

  const query = useQuery({
    queryKey: ["consent", clientId, scope, redirectUri, state, codeChallenge, codeChallengeMethod],
    queryFn: () => OAuthService.getConsentInfo(clientId, scope, redirectUri, state, codeChallenge, codeChallengeMethod),
    enabled: !!clientId && !!scope && !!redirectUri,
  })

  // Handle errors using useEffect or similar pattern if needed
  if (query.error) {
    // Error handling can be done at component level
  }

  return query
}

export function useConsent() {
  const toast = useToastContext()

  const mutation = useMutation({
    mutationFn: (data: ConsentRequest) => OAuthService.submitConsent(data),
    onError: (error) => {
      toast.addToast({
        title: "Failed to process consent",
        description: getErrorMessage(error),
        type: "error",
      })
    },
  })

  return {
    submitConsent: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}
