"use client"

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import TokenService, { type TokensResponse } from "@/lib/services/token-service"
import { useToastContext } from "@/providers/toast-provider"
import { getErrorMessage } from "@/lib/errors"

export function useTokens(page = 1, limit = 10) {
  const queryClient = useQueryClient()
  const toast = useToastContext()

  const { data, isLoading, error, refetch } = useQuery<TokensResponse>({
    queryKey: ["tokens", page, limit],
    queryFn: () => TokenService.getTokens(page, limit),
    placeholderData: keepPreviousData,
  })

  const revokeTokenMutation = useMutation({
    mutationFn: (id: string) => TokenService.revokeToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] })
      toast.addToast({
        title: "Token Revoked Successfully",
        description: "Token has been successfully revoked.",
        type: "success",
      })
    },
    onError: (error) => {
      toast.addToast({
        title: "Token Revocation Failed",
        description: getErrorMessage(error),
        type: "error",
      })
    },
  })

  return {
    tokens: data?.tokens || [],
    total: data?.total || 0,
    currentPage: data?.page || page,
    perPage: data?.per_page || limit,
    isLoading,
    error,
    refetch,
    revokeToken: revokeTokenMutation.mutate,
    isRevokeLoading: revokeTokenMutation.isPending,
    revokeError: revokeTokenMutation.error,
  }
}
