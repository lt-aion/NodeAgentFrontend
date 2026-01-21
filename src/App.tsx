import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/Layout'
import { Tasks } from '@/pages/Tasks'
import { TaskDetail } from '@/pages/TaskDetail'
import { CreateTask } from '@/pages/CreateTask'
import { Agents } from '@/pages/Agents'
import { Plugins } from '@/pages/Plugins'
import { BootstrapTokens } from '@/pages/BootstrapTokens'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Tasks />
              </Layout>
            }
          />
          <Route
            path="/tasks"
            element={
              <Layout>
                <Tasks />
              </Layout>
            }
          />
          <Route
            path="/tasks/new"
            element={
              <Layout>
                <CreateTask />
              </Layout>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <Layout>
                <TaskDetail />
              </Layout>
            }
          />
          <Route
            path="/agents"
            element={
              <Layout>
                <Agents />
              </Layout>
            }
          />
          <Route
            path="/plugins"
            element={
              <Layout>
                <Plugins />
              </Layout>
            }
          />
          <Route
            path="/bootstrap-tokens"
            element={
              <Layout>
                <BootstrapTokens />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

