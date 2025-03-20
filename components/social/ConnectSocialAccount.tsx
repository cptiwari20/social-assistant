"use client";

import { useState } from 'react';
import { useWorkspace } from '@/app/contexts/WorkspaceContext';
import { SocialPlatform } from '@/app/lib/types/social';

export default function ConnectSocialAccount() {
  const { currentWorkspace } = useWorkspace();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectPlatform = async (platform: SocialPlatform) => {
    try {
      setConnecting(true);
      setError(null);

      const response = await fetch(`/api/social/authorize/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to initiate connection');

      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      setError('Failed to connect account');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Connect New Account</h2>
      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.values(SocialPlatform).map((platform) => (
          <button
            key={platform}
            onClick={() => connectPlatform(platform)}
            disabled={connecting || !currentWorkspace}
            className={`p-4 border rounded-lg flex items-center justify-center space-x-2
              ${connecting ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500'}`}
          >
            <PlatformIcon platform={platform} />
            <span>Connect {platform}</span>
          </button>
        ))}
      </div>
      {!currentWorkspace && (
        <p className="text-sm text-gray-500">
          Please select a workspace to connect social media accounts
        </p>
      )}
    </div>
  );
} 