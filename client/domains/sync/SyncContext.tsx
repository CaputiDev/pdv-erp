import React, { createContext, useContext } from 'react';
import { SyncContextType } from './types';
import { useSyncManager } from './hooks/useSyncManager';

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const syncManager = useSyncManager();

  return (
    <SyncContext.Provider value={syncManager}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error("useSync deve ser usado dentro do SyncProvider");
  return context;
}
