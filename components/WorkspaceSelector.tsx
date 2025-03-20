"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useRouter } from "next/navigation";

interface Workspace {
  id: string;
  name: string;
}

export default function WorkspaceSelector() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/workspaces");
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      router.push(`/dashboard?workspace=${workspaceId}`);
    }
  };

  return (
    <div className="relative">
      <select
        value={currentWorkspace?.id || ""}
        onChange={(e) => handleWorkspaceChange(e.target.value)}
        className="block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Workspace</option>
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </select>
    </div>
  );
} 