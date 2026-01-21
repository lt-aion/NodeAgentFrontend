# Frontend

React frontend for Agent Management System using React, TanStack Query, TypeScript, and shadcn/ui components.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults are provided):
```bash
VITE_ORCH_URL=http://localhost:9090/v1
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Features

- **Tasks Management**: Create, view, and delete tasks
- **Agents Management**: View and manage agents
- **Plugins Management**: Create, update, and delete plugins

## Pages

- `/` - Tasks page
- `/agents` - Agents page
- `/plugins` - Plugins page

Note: Client endpoints don't require authentication. The frontend directly accesses the orchestrator service's `/v1/client/*` endpoints.

