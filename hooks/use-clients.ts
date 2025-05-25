"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import ClientService, { type ClientCreateRequest } from "@/lib/services/client-service"
import { useToastContext } from "@/providers/toast-provider"
import { getErrorMessage } from "@/lib/errors"

export function useClients(page = 1, limit = 10) {
  const queryClient = useQueryClient()
  const toast = useToastContext()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["clients", page, limit],
    queryFn: () => ClientService.getClients(page, limit),
    keepPreviousData: true,
  })

  const createClientMutation = useMutation({
    mutationFn: (clientData: ClientCreateRequest) => ClientService.createClient(clientData),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      toast.addToast({
        title: "클라이언트 생성 성공",
        description: `${newClient.client_name} 클라이언트가 성공적으로 생성되었습니다.`,
        type: "success",
      })
    },
    onError: (error) => {
      toast.addToast({
        title: "클라이언트 생성 실패",
        description: getErrorMessage(error),
        type: "error",
      })
    },
  })

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClientCreateRequest> }) =>
      ClientService.updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      queryClient.invalidateQueries({ queryKey: ["client", variables.id] })
      toast.addToast({
        title: "클라이언트 업데이트 성공",
        description: "클라이언트가 성공적으로 업데이트되었습니다.",
        type: "success",
      })
    },
    onError: (error) => {
      toast.addToast({
        title: "클라이언트 업데이트 실패",
        description: getErrorMessage(error),
        type: "error",
      })
    },
  })

  const deleteClientMutation = useMutation({
    mutationFn: (id: number) => ClientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      toast.addToast({
        title: "클라이언트 삭제 성공",
        description: "클라이언트가 성공적으로 삭제되었습니다.",
        type: "success",
      })
    },
    onError: (error) => {
      toast.addToast({
        title: "클라이언트 삭제 실패",
        description: getErrorMessage(error),
        type: "error",
      })
    },
  })

  return {
    clients: data?.clients || [],
    total: data?.total || 0,
    currentPage: data?.page || page,
    perPage: data?.per_page || limit,
    isLoading,
    error,
    refetch,
    createClient: createClientMutation.mutate,
    isCreateLoading: createClientMutation.isPending,
    createError: createClientMutation.error,
    updateClient: updateClientMutation.mutate,
    isUpdateLoading: updateClientMutation.isPending,
    updateError: updateClientMutation.error,
    deleteClient: deleteClientMutation.mutate,
    isDeleteLoading: deleteClientMutation.isPending,
    deleteError: deleteClientMutation.error,
  }
}

export function useClient(id: number) {
  const toast = useToastContext()

  return useQuery({
    queryKey: ["client", id],
    queryFn: () => ClientService.getClient(id),
    enabled: !!id,
    onError: (error) => {
      toast.addToast({
        title: "클라이언트 조회 실패",
        description: getErrorMessage(error),
        type: "error",
      })
    },
  })
}
