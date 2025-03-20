"use client";

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/app/contexts/WorkspaceContext';
import { SocialPlatform } from '@/app/lib/types/social';

interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  accountName: string;
  tokenExpiry: Date;
}

export default function SocialAccountsList() {
  const { currentWorkspace } = useWorkspace();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      fetchAccounts();
    }
  }, [currentWorkspace]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`/api/social/accounts?workspace=${currentWorkspace?.id}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      setError('Failed to load social media accounts');
    } finally {
      setLoading(false);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/social/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to disconnect account');
      setAccounts(accounts.filter(account => account.id !== accountId));
    } catch (error) {
      setError('Failed to disconnect account');
    }
  };

  if (loading) return <div>Loading accounts...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Connected Accounts</h2>
      {accounts.length === 0 ? (
        <p className="text-gray-500">No social media accounts connected</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div key={account.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PlatformIcon platform={account.platform} />
                  <div>
                    <h3 className="font-medium">{account.accountName}</h3>
                    <p className="text-sm text-gray-500">{account.platform}</p>
                  </div>
                </div>
                <button
                  onClick={() => disconnectAccount(account.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 