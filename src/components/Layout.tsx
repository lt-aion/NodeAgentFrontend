import { Link, useLocation } from 'react-router-dom'

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Tasks' },
    { path: '/agents', label: 'Agents' },
    { path: '/plugins', label: 'Plugins' },
    { path: '/bootstrap-tokens', label: 'Bootstrap Tokens' },
  ]

  return (
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="container mx-auto flex items-center h-16">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Agent Management</h1>
            <div className="flex gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

