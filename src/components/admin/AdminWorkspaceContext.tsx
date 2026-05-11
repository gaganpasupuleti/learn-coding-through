import { createContext, useContext, type ReactNode } from 'react'

import type { AdminWorkspaceValue } from './hooks/useAdminWorkspace'

const AdminWorkspaceContext = createContext<AdminWorkspaceValue | null>(null)

export function AdminWorkspaceProvider({
  value,
  children,
}: {
  value: AdminWorkspaceValue
  children: ReactNode
}) {
  return <AdminWorkspaceContext.Provider value={value}>{children}</AdminWorkspaceContext.Provider>
}

export function useAdminWorkspaceContext(): AdminWorkspaceValue {
  const ctx = useContext(AdminWorkspaceContext)
  if (!ctx) {
    throw new Error('useAdminWorkspaceContext must be used within AdminWorkspaceProvider')
  }
  return ctx
}
