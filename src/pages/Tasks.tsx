import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useTasks, useDeleteTask } from '@/hooks/useTasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus } from 'lucide-react'

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? dateString : date.toLocaleString()
}

export function Tasks() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [nodeId, setNodeId] = useState('')
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const nodeIdParam = searchParams.get('node_id')
    if (nodeIdParam) {
      setNodeId(nodeIdParam)
    }
  }, [searchParams])

  const { data, isLoading } = useTasks(nodeId, status || undefined, page, 10)
  const deleteTask = useDeleteTask()

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(taskId)
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }
  }

  const tasks = data?.data?.tasks || []

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Manage and monitor tasks</CardDescription>
            </div>
            <Button onClick={() => navigate('/tasks/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="node_id">Node ID</Label>
                <Input
                  id="node_id"
                  value={nodeId}
                  onChange={(e) => {
                    const newNodeId = e.target.value
                    setNodeId(newNodeId)
                    setPage(1)
                    if (newNodeId) {
                      setSearchParams({ node_id: newNodeId })
                    } else {
                      setSearchParams({})
                    }
                  }}
                  placeholder="Enter node ID"
                />
              </div>
              <div className="w-48">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => {
                  setStatus(v === 'all' ? '' : v)
                  setPage(1)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {nodeId ? 'No tasks found for this node' : 'Enter a Node ID to view tasks'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => {
                    const getStatusColor = (s: string) => {
                      switch (s.toLowerCase()) {
                        case 'success': return 'bg-green-100 text-green-800'
                        case 'failed': return 'bg-red-100 text-red-800'
                        case 'running': return 'bg-blue-100 text-blue-800'
                        case 'queued':
                        case 'received': return 'bg-yellow-100 text-yellow-800'
                        default: return 'bg-gray-100 text-gray-800'
                      }
                    }
                    return (
                      <TableRow key={task.task_id}>
                        <TableCell className="font-medium">
                          <Link to={`/tasks/${task.task_id}`} className="text-primary hover:underline">
                            {task.task_id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={task.description}>
                          {task.description || '-'}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(task.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link to={`/tasks/${task.task_id}`}>View</Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTask(task.task_id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
