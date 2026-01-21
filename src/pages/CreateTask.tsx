import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCreateTask } from '@/hooks/useTasks'
import { usePlugins } from '@/hooks/usePlugins'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, X } from 'lucide-react'
import type { CreateTaskRequest, Step, PluginStepPayload } from '@/lib/api'

const PLUGIN_STEP_TYPES = [
  { value: 'plugin.install', label: 'Install' },
  { value: 'plugin.uninstall', label: 'Uninstall' },
  { value: 'plugin.start', label: 'Start' },
  { value: 'plugin.stop', label: 'Stop' },
  { value: 'plugin.restart', label: 'Restart' },
  { value: 'plugin.status', label: 'Status' },
  { value: 'plugin.update_env_vars', label: 'Update Env Vars' },
] as const

type PluginStepType = typeof PLUGIN_STEP_TYPES[number]['value']

interface TaskStep {
  index: number
  step_type: PluginStepType
  plugin_id: string
  instance?: string
  env_vars?: { key: string; value: string }[]
  force?: boolean
}

export function CreateTask() {
  const navigate = useNavigate()
  const [steps, setSteps] = useState<TaskStep[]>([])
  const [formData, setFormData] = useState<Omit<CreateTaskRequest, 'payload'>>({
    node_id: '',
    type: 'plugin.manage',
    description: '',
    caller_id: '',
  })

  const { data: pluginsData } = usePlugins()
  const createTask = useCreateTask()

  const plugins = pluginsData?.data?.plugins || []

  const addStep = () => {
    const newStep: TaskStep = {
      index: steps.length,
      step_type: 'plugin.install',
      plugin_id: '',
    }
    setSteps([...steps, newStep])
  }

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index).map((step, i) => ({
      ...step,
      index: i,
    }))
    setSteps(newSteps)
  }

  const updateStep = (index: number, updates: Partial<TaskStep>) => {
    const newSteps = steps.map((step, i) =>
      i === index ? { ...step, ...updates } : step
    )
    setSteps(newSteps)
  }

  const buildPayload = (): CreateTaskRequest['payload'] => {
    const payloadSteps: Step[] = steps.map((step) => {
      const plugin: PluginStepPayload = {
        plugin_id: step.plugin_id,
      }

      if (step.instance) {
        plugin.options = {
          instance: step.instance,
        }
      }
      if (step.env_vars && step.env_vars.length > 0) {
        plugin.env_vars = Object.fromEntries(
          step.env_vars
            .filter(ev => ev.key.trim() !== '')
            .map(ev => [ev.key, ev.value])
        )
      }
      if (step.force !== undefined) {
        plugin.force = step.force
      }

      return {
        index: step.index,
        step_type: step.step_type,
        plugin,
      }
    })
    return { steps: payloadSteps }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (steps.length === 0) {
      alert('Please add at least one step')
      return
    }

    const payload = buildPayload()
    const request: CreateTaskRequest = {
      ...formData,
      payload,
    }

    try {
      const result = await createTask.mutateAsync(request)
      if (result?.data?.task_id) {
        navigate(`/tasks?node_id=${formData.node_id}`)
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/tasks')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create Task</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="node_id">Node ID *</Label>
              <Input
                id="node_id"
                value={formData.node_id}
                onChange={(e) => setFormData({ ...formData, node_id: e.target.value })}
                required
                placeholder="Enter node ID"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description"
              />
            </div>
            <div>
              <Label htmlFor="caller_id">Caller ID</Label>
              <Input
                id="caller_id"
                value={formData.caller_id}
                onChange={(e) => setFormData({ ...formData, caller_id: e.target.value })}
                placeholder="Caller identifier"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Steps</CardTitle>
              <Button type="button" onClick={addStep} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No steps added. Click "Add Step" to begin.</p>
            ) : (
              steps.map((step, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium">Step {step.index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Step Type</Label>
                      <Select
                        value={step.step_type}
                        onValueChange={(v: PluginStepType) => {
                          const supportsEnvVars = ['plugin.install', 'plugin.start', 'plugin.restart', 'plugin.update_env_vars'].includes(v)
                          const supportsForce = v === 'plugin.stop'
                          
                          updateStep(index, {
                            step_type: v,
                            env_vars: supportsEnvVars ? step.env_vars : undefined,
                            force: supportsForce ? step.force : undefined,
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLUGIN_STEP_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Plugin ID *</Label>
                      <Select
                        value={step.plugin_id}
                        onValueChange={(value) => updateStep(index, { plugin_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select or enter plugin ID" />
                        </SelectTrigger>
                        <SelectContent>
                          {plugins.map((plugin) => (
                            <SelectItem key={plugin.plugin_id} value={plugin.plugin_id}>
                              {plugin.plugin_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                    </div>
                    {(step.step_type === 'plugin.start' || step.step_type === 'plugin.restart') && (
                      <div>
                        <Label>Instance (optional)</Label>
                        <Input
                          value={step.instance || ''}
                          onChange={(e) => updateStep(index, { instance: e.target.value || undefined })}
                          placeholder="default"
                        />
                      </div>
                    )}
                    {(step.step_type === 'plugin.install' ||
                      step.step_type === 'plugin.start' ||
                      step.step_type === 'plugin.restart' ||
                      step.step_type === 'plugin.update_env_vars') && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Environment Variables (optional)</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentEnvVars = step.env_vars || []
                              updateStep(index, {
                                env_vars: [...currentEnvVars, { key: '', value: '' }],
                              })
                            }}
                          >
                            Add Env Var
                          </Button>
                        </div>
                        {step.env_vars && step.env_vars.length > 0 ? (
                          <div className="space-y-2">
                            {step.env_vars.map((ev, envIndex) => (
                              <div key={`${index}-${envIndex}`} className="flex gap-2">
                                <Input
                                  placeholder="Key"
                                  value={ev.key}
                                  onChange={(e) => {
                                    const newEnvVars = [...(step.env_vars || [])]
                                    newEnvVars[envIndex] = { ...ev, key: e.target.value }
                                    updateStep(index, { env_vars: newEnvVars })
                                  }}
                                  className="flex-1"
                                />
                                <Input
                                  placeholder="Value"
                                  value={ev.value}
                                  onChange={(e) => {
                                    const newEnvVars = [...(step.env_vars || [])]
                                    newEnvVars[envIndex] = { ...ev, value: e.target.value }
                                    updateStep(index, { env_vars: newEnvVars })
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const newEnvVars = (step.env_vars || []).filter((_, i) => i !== envIndex)
                                    updateStep(index, {
                                      env_vars: newEnvVars.length > 0 ? newEnvVars : undefined,
                                    })
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No environment variables added
                          </p>
                        )}
                      </div>
                    )}
                    {step.step_type === 'plugin.stop' && (
                      <div>
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={step.force || false}
                            onChange={(e) => updateStep(index, { force: e.target.checked || undefined })}
                          />
                          Force stop
                        </Label>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={createTask.isPending}>
            {createTask.isPending ? 'Creating...' : 'Create Task'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

