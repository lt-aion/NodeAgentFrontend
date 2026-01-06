import { useState } from 'react'
import { usePlugins, useCreatePlugin, useUpdatePlugin, useDeletePlugin } from '@/hooks/usePlugins'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { CreatePluginRequest, UpdatePluginRequest } from '@/lib/api'

export function Plugins() {
  const [open, setOpen] = useState(false)
  const [editingPlugin, setEditingPlugin] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreatePluginRequest>({
    plugin_id: '',
    plugin_name:'',
    publisher_name: '',
    artifact_url: '',
    version: '',
    description: '',
    driver_type: 'systemd',
    published_at: new Date().toISOString(),
  })

  const { data, isLoading } = usePlugins()
  const createPlugin = useCreatePlugin()
  const updatePlugin = useUpdatePlugin()
  const deletePlugin = useDeletePlugin()

  const plugins = data?.data?.plugins || []

  const handleCreatePlugin = async () => {
    try {
      const createData: CreatePluginRequest = {
        plugin_id: formData.plugin_id,
        plugin_name: formData.plugin_name,
        publisher_name: formData.publisher_name,
        published_at: formData.published_at,
        artifact_url: formData.artifact_url,
        version: formData.version,
        description: formData.description,
        driver_type: formData.driver_type,
      }
      await createPlugin.mutateAsync(createData)
      setOpen(false)
      setFormData({
        plugin_id: '',
        plugin_name:'',
        publisher_name: '',
        artifact_url: '',
        version: '',
        description: '',
        driver_type: 'systemd',
        published_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Failed to create plugin:', err)
    }
  }

  const handleUpdatePlugin = async () => {
    if (!editingPlugin) return
    try {
      const updateData: UpdatePluginRequest = {
        plugin_name: formData.plugin_name,
        publisher_name: formData.publisher_name,
        artifact_url: formData.artifact_url,
        version: formData.version,
        description: formData.description,
        driver_type: formData.driver_type,
        published_at: formData.published_at,
      }
      await updatePlugin.mutateAsync({ pluginId: editingPlugin, data: updateData })
      setOpen(false)
      setEditingPlugin(null)
      setFormData({
        plugin_id: '',
        plugin_name:'',
        publisher_name: '',
        artifact_url: '',
        version: '',
        description: '',
        driver_type: 'systemd',
        published_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Failed to update plugin:', err)
    }
  }

  const handleDeletePlugin = async (pluginId: string) => {
    if (confirm('Are you sure you want to delete this plugin?')) {
      try {
        await deletePlugin.mutateAsync(pluginId)
      } catch (err) {
        console.error('Failed to delete plugin:', err)
      }
    }
  }

  const handleEdit = (plugin: typeof plugins[0]) => {
    setEditingPlugin(plugin.plugin_id)
    setFormData({
      plugin_id: plugin.plugin_id,
      plugin_name:plugin.plugin_name,
      publisher_name: plugin.publisher_name,
      artifact_url: plugin.artifact_url,
      version: plugin.version,
      description: plugin.description,
      driver_type: plugin.driver_type,
      published_at: plugin.published_at,
    })
    setOpen(true)
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Plugins</CardTitle>
          <CardDescription>Manage plugins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingPlugin(null)
                  setFormData({
                    plugin_id: '',
                    plugin_name:'',
                    publisher_name: '',
                    artifact_url: '',
                    version: '',
                    description: '',
                    driver_type: 'systemd',
                    published_at: new Date().toISOString(),
                  })
                }}>
                  Create Plugin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPlugin ? 'Update Plugin' : 'Create Plugin'}</DialogTitle>
                  <DialogDescription>
                    {editingPlugin ? 'Update plugin information' : 'Create a new plugin'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {!editingPlugin && (
                    <div>
                      <Label htmlFor="plugin_id">Plugin ID</Label>
                      <Input
                        id="plugin_id"
                        value={formData.plugin_id}
                        onChange={(e) => setFormData({ ...formData, plugin_id: e.target.value })}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="plugin_name">Plugin Name</Label>
                    <Input
                      id="plugin_name"
                      value={formData.plugin_name}
                      onChange={(e) => setFormData({ ...formData, plugin_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="publisher_name">Publisher Name</Label>
                    <Input
                      id="publisher_name"
                      value={formData.publisher_name}
                      onChange={(e) => setFormData({ ...formData, publisher_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="driver_type">Driver Type</Label>
                    <Select
                      value={formData.driver_type}
                      onValueChange={(value: 'systemd' | 'kubernetes') => setFormData({ ...formData, driver_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="systemd">systemd</SelectItem>
                        <SelectItem value="kubernetes">kubernetes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="published_at">Published At</Label>
                    <Input
                      id="published_at"
                      type="datetime-local"
                      value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, published_at: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString() })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="artifact_url">Artifact URL</Label>
                    <Input
                      id="artifact_url"
                      value={formData.artifact_url}
                      onChange={(e) => setFormData({ ...formData, artifact_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={editingPlugin ? handleUpdatePlugin : handleCreatePlugin}
                    disabled={createPlugin.isPending || updatePlugin.isPending}
                  >
                    {editingPlugin ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div>Loading...</div>
          ) : plugins.length === 0 ? (
            <div>No plugins found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plugin ID</TableHead>
                  <TableHead>Plugin Name</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Driver Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Artifact URL</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plugins.map((plugin) => (
                  <TableRow key={plugin.plugin_id}>
                    <TableCell>{plugin.plugin_id}</TableCell>
                    <TableCell>{plugin.plugin_name}</TableCell>
                    <TableCell>{plugin.publisher_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{plugin.description}</TableCell>
                    <TableCell>{plugin.driver_type}</TableCell>
                    <TableCell>{plugin.version}</TableCell>
                    <TableCell className="max-w-xs truncate">{plugin.artifact_url}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plugin)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePlugin(plugin.plugin_id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

