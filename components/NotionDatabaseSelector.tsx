"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "../contexts/WorkspaceContext";
import type { NotionDatabase, NotionMapping } from "@/app/lib/notion";

export default function NotionDatabaseSelector() {
  const { currentWorkspace } = useWorkspace();
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [mapping, setMapping] = useState<NotionMapping>({
    content: "",
    scheduledDate: "",
    platforms: "",
    media: "",
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      fetchDatabases();
    }
  }, [currentWorkspace]);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notion/databases");
      if (response.ok) {
        const data = await response.json();
        setDatabases(data);
      }
    } catch (error) {
      console.error("Error fetching databases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = async () => {
    try {
      const response = await fetch("/api/notion/mapping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          databaseId: selectedDatabase,
          mapping,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save mapping");
      }
    } catch (error) {
      console.error("Error saving mapping:", error);
    }
  };

  const handleSync = async () => {
    if (!currentWorkspace || !selectedDatabase) return;

    try {
      setSyncing(true);
      const response = await fetch("/api/notion/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          databaseId: selectedDatabase,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync with Notion");
      }

      // Show success message or update UI
    } catch (error) {
      console.error("Error syncing with Notion:", error);
      // Show error message
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div>Loading databases...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select Database
        </label>
        <select
          value={selectedDatabase}
          onChange={(e) => setSelectedDatabase(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a database</option>
          {databases.map((db) => (
            <option key={db.id} value={db.id}>
              {db.title}
            </option>
          ))}
        </select>
      </div>

      {selectedDatabase && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Map Properties</h3>
          {Object.entries(mapping).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <select
                value={value}
                onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a property</option>
                {selectedDatabase && databases
                  .find((db) => db.id === selectedDatabase)
                  ?.properties.map((prop: any) => (
                    <option key={prop.id} value={prop.name}>
                      {prop.name}
                    </option>
                  ))}
              </select>
            </div>
          ))}
          <div className="flex gap-4">
            <button
              onClick={handleMappingChange}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save Mapping
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`bg-green-600 text-white px-4 py-2 rounded-md ${
                syncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
              }`}
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 