import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orchAPI, type CreateTaskRequest } from '@/lib/api'

export function useTasks(nodeId: string, status?: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['tasks', nodeId, status, page, limit],
    queryFn: () => orchAPI.getTasks(nodeId, status, page, limit),
    enabled: !!nodeId,
    refetchOnMount: true,
  })
}

export function useTask(taskId: number) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => orchAPI.getTask(taskId),
    enabled: !!taskId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (req: CreateTaskRequest) => orchAPI.createTask(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: number) => orchAPI.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useTaskLogs(taskId: number) {
  return useQuery({
    queryKey: ['task-logs', taskId],
    queryFn: () => orchAPI.getTaskLogs(taskId),
    enabled: !!taskId,
  })
}

export function useTaskStatusAuditLogs(taskId: number) {
  return useQuery({
    queryKey: ['task-audit', taskId],
    queryFn: () => orchAPI.getTaskStatusAuditLogs(taskId),
    enabled: !!taskId,
  })
}
