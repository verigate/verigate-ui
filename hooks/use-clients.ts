"use client"

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import ClientService, { type ClientCreateRequest, type ClientsResponse, type Client } from "@/lib/services/client-service"
import { useToastContext } from "@/providers/toast-provider"
import { getErrorMessage } from "@/lib/errors"

export function useClients(page = 1, limit = 10) {
  const queryClient = useQueryClient()
  const toast = useToastContext()

  const { data, isLoading, error, refetch } = useQuery<ClientsResponse>({
    queryKey: ["clients", page, limit],
    queryFn: () => ClientService.getClients(page, limit),
    placeholderData: keepPreviousData,
  })

  const createClientMutation = useMutation({
    mutationFn: (clientData: ClientCreateRequest) => ClientService.createClient(clientData),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      toast.addToast({
        title: "Client Created Successfully",
        description: `${newClient.client_name} client has been successfully created.`,
        type: "success",
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
        title: "Client Updated Successfully",
        description: "Client has been successfully updated.",
        type: "success",
      })
    },
    onError: (error) => {
      toast.addToast({
        title: "Client Update Failed",
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
        title: "Client Deleted Successfully",
        description: "Client has been successfully deleted.",
        type: "success",
      })
    },
    onError: (error) => {
      toast.addToast({
        title: "Client Deletion Failed",
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
  return useQuery<Client>({
    queryKey: ["client", id],
    queryFn: () => ClientService.getClient(id),
    enabled: !!id,
  })
}
