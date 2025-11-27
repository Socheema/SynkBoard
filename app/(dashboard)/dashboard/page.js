'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import { useWorkspace } from '@/hook/useWorkspace';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspaceStore();
  const { workspaces, loading } = useWorkspace();

  useEffect(() => {
    // Redirect to workspace if one is selected
    if (currentWorkspace) {
      router.push(`/workspace/${currentWorkspace.id}`);
    }
  }, [currentWorkspace, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to SynkBoard! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You're not part of any workspace yet. Create one to get started or join an existing workspace with an invite code.
          </p>
          <div className="text-gray-500 dark:text-gray-500">
            Use the workspace selector above to create or join a workspace
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );
}
