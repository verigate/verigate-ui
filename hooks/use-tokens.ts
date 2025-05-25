"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import TokenService from "@/lib/services/token-service"
import { useToastContext } from "@/providers/toast-provider"
import { getErrorMessage } from "@/lib/errors"

export function useTokens(page = 1, limit = 10) {
  const queryClient = useQueryClient()
  const toast = useToastContext()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tokens", page, limit],
    queryFn: () => TokenService.getTokens(page, limit),
    keepPreviousData: true,
  })

  const revokeTokenMutation = useMutation({
    mutationFn: (id: string) => TokenService.revokeToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] })
      toast.addToast({
        title: "토큰 취소 성공",
        description: "토큰이 성공적으로 취소되었습니다.",
        type: "success",
      })
    },
    onError: (error) => {
      toast.addToast({
        title: "토큰 취소 실패",
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
