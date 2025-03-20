"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspace");

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/workspaces/${workspaceId}`);
        if (response.ok) {
          const workspace = await response.json();
          setCurrentWorkspace(workspace);
        }
      } catch (error) {
        console.error("Error fetching workspace:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  return (
    <WorkspaceContext.Provider
      value={{ currentWorkspace, setCurrentWorkspace, loading }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
} 