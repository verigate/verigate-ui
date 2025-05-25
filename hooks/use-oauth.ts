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

  return useQuery({
    queryKey: ["consent", clientId, scope, redirectUri, state, codeChallenge, codeChallengeMethod],
    queryFn: () => OAuthService.getConsentInfo(clientId, scope, redirectUri, state, codeChallenge, codeChallengeMethod),
    enabled: !!clientId && !!scope && !!redirectUri,
    onError: (error) => {
      toast.addToast({
        title: "동의 정보 조회 실패",
        description: getErrorMessage(error),
        type: "error",
      })
    },
  })
}

export function useConsent() {
  const toast = useToastContext()

  const mutation = useMutation({
    mutationFn: (data: ConsentRequest) => OAuthService.submitConsent(data),
    onError: (error) => {
      toast.addToast({
        title: "동의 처리 실패",
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
