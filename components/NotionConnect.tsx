"use client";

import { useState } from "react";
import { useWorkspace } from "../contexts/WorkspaceContext";

export default function NotionConnect() {
  const { currentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectNotion = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/notion/authorize");
      const { authUrl } = await response.json();

      // Add workspace ID to the auth URL
      const urlWithWorkspace = `${authUrl}&state=${currentWorkspace?.id}`;
      window.location.href = urlWithWorkspace;
    } catch (error) {
      setError("Failed to connect to Notion");
      console.error("Notion connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Connect Notion</h2>
      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}
      <button
        onClick={connectNotion}
        disabled={loading || !currentWorkspace}
        className={`bg-black text-white px-4 py-2 rounded-lg ${
          loading || !currentWorkspace ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
        }`}
      >
        {loading ? "Connecting..." : "Connect to Notion"}
      </button>
      {!currentWorkspace && (
        <p className="text-sm text-gray-500 mt-2">
          Please select a workspace first
        </p>
      )}
    </div>
  );
} 