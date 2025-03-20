"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/workspaces");
      if (!response.ok) throw new Error("Failed to fetch workspaces");
      const data = await response.json();
      setWorkspaces(data);
    } catch (error) {
      setError("Error loading workspaces");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newWorkspaceName }),
      });

      if (!response.ok) throw new Error("Failed to create workspace");
      
      const newWorkspace = await response.json();
      setWorkspaces([...workspaces, newWorkspace]);
      setNewWorkspaceName("");
    } catch (error) {
      setError("Error creating workspace");
    }
  };

  const selectWorkspace = (workspaceId: string) => {
    router.push(`/dashboard?workspace=${workspaceId}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Workspaces</h1>
      
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Workspace</h2>
        <form onSubmit={createWorkspace} className="flex gap-2">
          <input
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="Workspace name"
            className="flex-1 p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="border rounded-lg p-4 cursor-pointer hover:border-blue-500"
            onClick={() => selectWorkspace(workspace.id)}
          >
            <h3 className="font-semibold">{workspace.name}</h3>
            <p className="text-sm text-gray-500">
              Created: {new Date(workspace.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {workspaces.length === 0 && (
        <p className="text-gray-500 text-center">No workspaces found</p>
      )}
    </div>
  );
} 