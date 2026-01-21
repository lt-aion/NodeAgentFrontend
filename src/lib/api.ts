const ORCH_BASE_URL = import.meta.env.VITE_ORCH_URL || "http://task.13.234.74.6.nip.io";
const AUTHN_BASE_URL = import.meta.env.VITE_AUTHN_URL || "http://auth.13.234.74.6.nip.io/api";

export interface APIResponse<T> {
  status: "success" | "error";
  message: string;
  error_code: string | null;
  data: T | null;
}

export interface Task {
  task_id: number;
  node_id: string;
  agent_id: string;
  caller_id: string;
  type: string;
  description: string;
  payload: TaskPayload;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TaskPayload {
  steps: Step[];
}

export interface Step {
  index: number;
  step_type: string;
  plugin?: PluginStepPayload;
}

export interface PluginStepPayload {
  plugin_id: string;
  options?: {
    instance?: string;
  };
  env_vars?: Record<string, string>;
  force?: boolean;
}

export interface CreateTaskRequest {
  node_id: string;
  type: string;
  description?: string;
  payload: TaskPayload;
  caller_id: string;
}

export interface Agent {
  agent_id: string;
  node_id: string;
  status: string;
  last_seen_at: string;
  version: string;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Plugin {
  plugin_id: string;
  plugin_name: string;
  publisher_name: string;
  published_at: string;
  artifact_url: string;
  version: string;
  description: string;
  driver_type: "systemd" | "kubernetes";
}

export interface CreatePluginRequest {
  plugin_id: string;
  plugin_name: string;
  publisher_name: string;
  published_at?: string;
  artifact_url: string;
  version: string;
  description: string;
  driver_type: "systemd" | "kubernetes";
}

export interface UpdatePluginRequest {
  plugin_name: string;
  publisher_name: string;
  published_at: string;
  artifact_url: string;
  version: string;
  description: string;
  driver_type: "systemd" | "kubernetes";
}

export interface GetTasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetAgentsResponse {
  agents: Agent[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetLogsResponse {
  logs: LogEntry[];
}

export interface LogEntry {
  step_index: number;
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
}

export interface GetTaskStatusAuditLogsResponse {
  audit_logs: AuditLog[];
}

export interface AuditLog {
  id: number;
  task_id: number;
  status: string;
  created_at: string;
}

export interface CreateBootstrapTokenRequest {
  node_id: string;
  expires_in?: number;
}

export interface BootstrapTokenResponse {
  token: string;
  node_id: string;
  expires_at: string;
}

export interface LoginRequest {
  client_id: string;
  client_secret: string;
  auth_type: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface IntrospectRequest {
  token: string;
}

export interface IntrospectResponse {
  active: boolean;
  exp?: number;
  iat?: number;
  agent_id?: string;
  node_id?: string;
  auth_type?: string;
}

function getHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

async function fetchAPI<T>(
  url: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<APIResponse<T>> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(accessToken),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      status: "error",
      message: "Request failed",
      error_code: "REQUEST_FAILED",
      data: null,
    }));
    throw error;
  }

  return response.json();
}

export const orchAPI = {
  createTask: async (
    req: CreateTaskRequest,
  ): Promise<APIResponse<{ task_id: number; task_status: string }>> => {
    return fetchAPI(`${ORCH_BASE_URL}/v1/client/tasks`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  getTasks: async (
    nodeId: string,
    status?: string,
    page = 1,
    limit = 10,
  ): Promise<APIResponse<GetTasksResponse>> => {
    const params = new URLSearchParams({
      node_id: nodeId,
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append("status", status);
    }
    return fetchAPI<GetTasksResponse>(
      `${ORCH_BASE_URL}/v1/client/tasks?${params}`,
    );
  },

  getTask: async (taskId: number): Promise<APIResponse<{ task: Task }>> => {
    return fetchAPI<{ task: Task }>(
      `${ORCH_BASE_URL}/v1/client/tasks/${taskId}`,
    );
  },

  deleteTask: async (taskId: number): Promise<APIResponse<null>> => {
    return fetchAPI<null>(`${ORCH_BASE_URL}/v1/client/tasks/${taskId}`, {
      method: "DELETE",
    });
  },

  getTaskLogs: async (
    taskId: number,
  ): Promise<APIResponse<GetLogsResponse>> => {
    return fetchAPI<GetLogsResponse>(
      `${ORCH_BASE_URL}/v1/client/tasks/${taskId}/logs`,
    );
  },

  getTaskStatusAuditLogs: async (
    taskId: number,
  ): Promise<APIResponse<GetTaskStatusAuditLogsResponse>> => {
    return fetchAPI<GetTaskStatusAuditLogsResponse>(
      `${ORCH_BASE_URL}/v1/client/tasks/${taskId}/audit`,
    );
  },

  getAgents: async (
    status?: string,
    page = 1,
    limit = 10,
  ): Promise<APIResponse<GetAgentsResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append("status", status);
    }
    return fetchAPI<GetAgentsResponse>(
      `${ORCH_BASE_URL}/v1/client/agents?${params}`,
    );
  },

  getAgent: async (nodeId: string): Promise<APIResponse<{ agent: Agent }>> => {
    return fetchAPI<{ agent: Agent }>(
      `${ORCH_BASE_URL}/v1/client/agents/${nodeId}`,
    );
  },

  deleteAgent: async (agentId: string): Promise<APIResponse<null>> => {
    return fetchAPI<null>(`${ORCH_BASE_URL}/v1/client/agents/${agentId}`, {
      method: "DELETE",
    });
  },

  getAllPlugins: async (): Promise<APIResponse<{ plugins: Plugin[] }>> => {
    return fetchAPI<{ plugins: Plugin[] }>(
      `${ORCH_BASE_URL}/v1/client/plugins`,
    );
  },

  getPlugin: async (
    pluginId: string,
  ): Promise<APIResponse<{ plugin: Plugin }>> => {
    return fetchAPI<{ plugin: Plugin }>(
      `${ORCH_BASE_URL}/v1/client/plugins/${pluginId}`,
    );
  },

  createPlugin: async (
    req: CreatePluginRequest,
  ): Promise<APIResponse<{ plugin: Plugin }>> => {
    return fetchAPI<{ plugin: Plugin }>(
      `${ORCH_BASE_URL}/v1/client/plugins/publish`,
      {
        method: "POST",
        body: JSON.stringify(req),
      },
    );
  },

  updatePlugin: async (
    pluginId: string,
    req: UpdatePluginRequest,
  ): Promise<APIResponse<{ plugin: Plugin }>> => {
    return fetchAPI<{ plugin: Plugin }>(
      `${ORCH_BASE_URL}/v1/client/plugins/${pluginId}`,
      {
        method: "PUT",
        body: JSON.stringify(req),
      },
    );
  },

  deletePlugin: async (pluginId: string): Promise<APIResponse<null>> => {
    return fetchAPI<null>(`${ORCH_BASE_URL}/v1/client/plugins/${pluginId}`, {
      method: "DELETE",
    });
  },
};

export const authnAPI = {
  createBootstrapToken: async (
    nodeId: string,
    expiresIn?: number,
    accessToken?: string,
  ): Promise<APIResponse<BootstrapTokenResponse>> => {
    const req: CreateBootstrapTokenRequest = {
      node_id: nodeId,
    };
    if (expiresIn !== undefined) {
      req.expires_in = expiresIn;
    }
    return fetchAPI<BootstrapTokenResponse>(
      `${AUTHN_BASE_URL}/v1/bootstrap/tokens`,
      {
        method: "POST",
        body: JSON.stringify(req),
      },
      accessToken,
    );
  },

  login: async (
    req: LoginRequest,
  ): Promise<APIResponse<LoginResponse>> => {
    return fetchAPI<LoginResponse>(`${AUTHN_BASE_URL}/v1/authn/login`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  refresh: async (
    req: RefreshRequest,
  ): Promise<APIResponse<RefreshResponse>> => {
    return fetchAPI<RefreshResponse>(`${AUTHN_BASE_URL}/v1/authn/refresh`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  introspect: async (
    token: string,
  ): Promise<APIResponse<IntrospectResponse>> => {
    return fetchAPI<IntrospectResponse>(
      `${AUTHN_BASE_URL}/v1/authn/introspect`,
      {
        method: "POST",
      },
      token
    );
  },
};
