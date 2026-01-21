import { useState } from 'react'
import { useAgents, useDeleteAgent } from '@/hooks/useAgents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const INACTIVE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

// Helper to handle backend sending local time with 'Z' suffix
function parseAgentTime(timeStr: string): Date {
  if (timeStr.endsWith('Z')) {
    return new Date(timeStr.slice(0, -1))
  }
  return new Date(timeStr)
}

function getAgentStatus(lastSeenAt: string, originalStatus: string): { status: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  const lastSeen = parseAgentTime(lastSeenAt).getTime()
  const now = Date.now()
  const timeSinceLastSeen = now - lastSeen

  if (timeSinceLastSeen > INACTIVE_THRESHOLD_MS) {
    return { status: 'inactive', variant: 'secondary' }
  }

  switch (originalStatus) {
    case 'active':
      return { status: 'active', variant: 'default' }
    case 'inactive':
      return { status: 'inactive', variant: 'secondary' }
    case 'offline':
      return { status: 'offline', variant: 'outline' }
    default:
      return { status: originalStatus, variant: 'outline' }
  }
}

export function Agents() {
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAgents(status || undefined, page, 10)
  const deleteAgent = useDeleteAgent()

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        await deleteAgent.mutateAsync(agentId)
      } catch (err) {
        console.error('Failed to delete agent:', err)
      }
    }
  }

  const agents = data?.data?.agents || []

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>Manage agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={status} onValueChange={(v) => {
              setStatus(v === 'all' ? '' : v)
              setPage(1)
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : agents.length === 0 ? (
            <div>No agents found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent ID</TableHead>
                    <TableHead>Node ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.agent_id}>
                      <TableCell>{agent.agent_id}</TableCell>
                      <TableCell>{agent.node_id}</TableCell>
                      <TableCell>
                        {(() => {
                          const { status, variant } = getAgentStatus(agent.last_seen_at, agent.status)
                          return <Badge variant={variant}>{status}</Badge>
                        })()}
                      </TableCell>
                      <TableCell>{agent.version}</TableCell>
                      <TableCell>{parseAgentTime(agent.last_seen_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAgent(agent.agent_id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data?.data && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {data.data.page} of {data.data.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.data.total_pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

