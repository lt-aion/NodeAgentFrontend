import { useState } from 'react'
import { useCreateBootstrapToken } from '@/hooks/useBootstrapTokens'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function BootstrapTokens() {
  const [open, setOpen] = useState(false)
  const [nodeId, setNodeId] = useState('')
  const [expiresIn, setExpiresIn] = useState('')
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [createdTokenExpiresAt, setCreatedTokenExpiresAt] = useState<string | null>(null)
  const [createdNodeId, setCreatedNodeId] = useState<string | null>(null)

  const createBootstrapToken = useCreateBootstrapToken()

  const handleCreateToken = async () => {
    if (!nodeId.trim()) {
      alert('Node ID is required')
      return
    }

    try {
      const expiresInNum = expiresIn ? parseInt(expiresIn, 10) : undefined
      if (expiresIn && (isNaN(expiresInNum!) || expiresInNum! <= 0)) {
        alert('Expires in must be a positive number')
        return
      }

      const response = await createBootstrapToken.mutateAsync({
        nodeId: nodeId.trim(),
        expiresIn: expiresInNum,
      })

      if (response.data) {
        setCreatedToken(response.data.token)
        setCreatedTokenExpiresAt(response.data.expires_at)
        setCreatedNodeId(response.data.node_id)
        setOpen(false)
        setNodeId('')
        setExpiresIn('')
      }
    } catch (err: any) {
      console.error('Failed to create bootstrap token:', err)
      alert(err?.message || 'Failed to create bootstrap token')
    }
  }

  const handleCopyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken)
      alert('Token copied to clipboard!')
    }
  }

  const handleCloseDialog = () => {
    setOpen(false)
    setNodeId('')
    setExpiresIn('')
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Bootstrap Tokens</CardTitle>
          <CardDescription>Create bootstrap tokens for agent registration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCloseDialog}>Create Bootstrap Token</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Bootstrap Token</DialogTitle>
                  <DialogDescription>
                    Create a bootstrap token for a node. The token can be used to register an agent.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="node_id">Node ID *</Label>
                    <Input
                      id="node_id"
                      value={nodeId}
                      onChange={(e) => setNodeId(e.target.value)}
                      placeholder="Enter node ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expires_in">Expires In (seconds)</Label>
                    <Input
                      id="expires_in"
                      type="number"
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(e.target.value)}
                      placeholder="86400 (default: 24 hours)"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Optional. Default is 86400 seconds (24 hours)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateToken}
                    disabled={createBootstrapToken.isPending || !nodeId.trim()}
                  >
                    {createBootstrapToken.isPending ? 'Creating...' : 'Create Token'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {createdToken && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Bootstrap Token Created</CardTitle>
                <CardDescription>Copy this token to use for agent registration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Node ID</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md font-mono text-sm">
                    {createdNodeId}
                  </div>
                </div>
                <div>
                  <Label>Token</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md font-mono text-sm break-all">
                    {createdToken}
                  </div>
                </div>
                <div>
                  <Label>Expires At</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                    {createdTokenExpiresAt
                      ? new Date(createdTokenExpiresAt).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
                <Button onClick={handleCopyToken} className="w-full">
                  Copy Token
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreatedToken(null)
                    setCreatedTokenExpiresAt(null)
                    setCreatedNodeId(null)
                  }}
                  className="w-full"
                >
                  Clear
                </Button>
              </CardContent>
            </Card>
          )}

          {!createdToken && (
            <div className="text-center text-muted-foreground py-8">
              No token created yet. Click "Create Bootstrap Token" to generate one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

