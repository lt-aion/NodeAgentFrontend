import { useMutation } from '@tanstack/react-query'
import { authnAPI } from '@/lib/api'

export function useCreateBootstrapToken() {
  return useMutation({
    mutationFn: ({
      nodeId,
      expiresIn,
      accessToken,
    }: {
      nodeId: string
      expiresIn?: number
      accessToken?: string
    }) => authnAPI.createBootstrapToken(nodeId, expiresIn, accessToken),
  })
}

