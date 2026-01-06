import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  orchAPI,
  type CreatePluginRequest,
  type UpdatePluginRequest,
} from '@/lib/api'

export function usePlugins() {
  return useQuery({
    queryKey: ['plugins'],
    queryFn: () => orchAPI.getAllPlugins(),
  })
}

export function usePlugin(pluginId: string) {
  return useQuery({
    queryKey: ['plugin', pluginId],
    queryFn: () => orchAPI.getPlugin(pluginId),
    enabled: !!pluginId,
  })
}

export function useCreatePlugin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (req: CreatePluginRequest) => orchAPI.createPlugin(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] })
    },
  })
}

export function useUpdatePlugin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pluginId,
      data,
    }: {
      pluginId: string
      data: UpdatePluginRequest
    }) => orchAPI.updatePlugin(pluginId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] })
    },
  })
}

export function useDeletePlugin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pluginId: string) => orchAPI.deletePlugin(pluginId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] })
    },
  })
}

