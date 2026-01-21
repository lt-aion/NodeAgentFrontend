import { useParams, useNavigate } from "react-router-dom";
import { useTask, useTaskLogs, useTaskStatusAuditLogs } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const taskIdNum = taskId ? parseInt(taskId, 10) : 0;
  const { data: taskDetail, isLoading } = useTask(taskIdNum);
  const { data: taskLogs } = useTaskLogs(taskIdNum);
  const { data: taskStatusAuditLogs } = useTaskStatusAuditLogs(taskIdNum);

  const task = taskDetail?.data?.task;
  const taskStatusAuditLogsData = taskStatusAuditLogs?.data;

  if (isLoading) {
    return <div className="p-6">Loading task details...</div>;
  }

  if (!task) {
    return (
      <div className="p-6">
        <Button
          variant="outline"
          onClick={() => navigate("/tasks")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
        <div>Task not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/tasks")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Task {task.task_id}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Status</Label>
          <p className="font-medium">{task.status}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Agent ID</Label>
          <p className="font-medium">{task.agent_id || "N/A"}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Caller ID</Label>
          <p className="font-medium">{task.caller_id}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Type</Label>
          <p className="font-medium">{task.type}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Created At</Label>
          <p className="font-medium">{(task.created_at)}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Updated At</Label>
          <p className="font-medium">{(task.updated_at)}</p>
        </div>
      </div>

      {task.description && (
        <div>
          <Label className="text-xs text-muted-foreground">Description</Label>
          <p className="font-medium">{task.description}</p>
        </div>
      )}

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold mb-2 block">Steps</Label>
        {task.payload?.steps && task.payload.steps.length > 0 ? (
          <div className="space-y-3">
            {task.payload.steps.map((step, index) => (
              <Card key={index} className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Step {step.index}
                      </span>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded">
                        {step.step_type}
                      </span>
                    </div>
                    {step.plugin && (
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>{step.step_type}:</strong>{" "}
                          {step.plugin.plugin_id}
                          {step.plugin.options?.instance &&
                            ` (instance: ${step.plugin.options.instance})`}
                          {step.plugin.force !== undefined &&
                            ` (force: ${step.plugin.force})`}
                        </p>
                        {step.plugin.env_vars &&
                          Object.keys(step.plugin.env_vars).length > 0 && (
                            <div className="mt-1 ml-4 text-xs">
                              <strong>Env Vars:</strong>
                              <pre className="bg-muted p-2 rounded mt-1">
                                {JSON.stringify(step.plugin.env_vars, null, 2)}
                              </pre>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
                {taskLogs?.data?.logs && (
                  <div className="mt-3 pt-3 border-t">
                    {taskLogs.data.logs
                      .filter((log) => log.step_index === step.index)
                      .map((log, logIndex) => (
                        <div key={logIndex} className="text-xs space-y-1">
                          {log.stdout && (
                            <div>
                              <strong className="text-green-600">
                                STDOUT:
                              </strong>
                              <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap">
                                {log.stdout}
                              </pre>
                            </div>
                          )}
                          {log.stderr && (
                            <div>
                              <strong className="text-red-600">STDERR:</strong>
                              <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap">
                                {log.stderr}
                              </pre>
                            </div>
                          )}
                          <div className="flex gap-4 text-muted-foreground">
                            <span>Exit Code: {log.exit_code}</span>
                            <span>Duration: {log.duration_ms}ms</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No steps</p>
        )}

        {taskStatusAuditLogsData?.audit_logs && taskStatusAuditLogsData.audit_logs.length > 0 && (
          <div className="mt-6">
            <Label className="text-sm font-semibold mb-2 block">
              Status Audit Logs
            </Label>

            <div className="space-y-2">
              {taskStatusAuditLogsData.audit_logs.sort((a, b) => a.id - b.id).map(
                ({ id, status, created_at }) => (
                  <Card key={id} className="p-3">
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div className="col-span-1">
                        <Label className="text-xs text-muted-foreground">
                          Status
                        </Label>
                        <p className="font-medium">{status}</p>
                      </div>

                      <div className="col-span-1">
                        <Label className="text-xs text-muted-foreground">
                          Timestamp
                        </Label>
                        <p className="font-medium">{created_at}</p>
                      </div>
                    </div>
                  </Card>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
