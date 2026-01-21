import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orchAPI } from '@/lib/api'

export function useAgents(status?: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['agents', status, page, limit],
    queryFn: () => orchAPI.getAgents(status, page, limit),
  })
}

export function useAgent(nodeId: string) {
  return useQuery({
    queryKey: ['agent', nodeId],
    queryFn: () => orchAPI.getAgent(nodeId),
    enabled: !!nodeId,
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (agentId: string) => orchAPI.deleteAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

