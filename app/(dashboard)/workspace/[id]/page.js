'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import { useWidgetStore } from '@/lib/store/widgetStore';
import { useRealtimeWidgets } from '@/hook/useRealtime';
import Board from '@/components/board/Board';
import { Loader2 } from 'lucide-react';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setCurrentWorkspace, currentWorkspace } = useWorkspaceStore();
  const { setWidgets, reset: resetWidgets } = useWidgetStore();

  // Enable realtime sync
  useRealtimeWidgets(workspaceId);

  useEffect(() => {
    if (!workspaceId || !user) return;

    // Reset widgets when workspace changes
    resetWidgets();

    loadWorkspaceData();
  }, [workspaceId, user]);

  async function loadWorkspaceData() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // Load workspace details
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (workspaceError) throw workspaceError;

      // Check if user is a member
      const { data: membership, error: memberError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        throw new Error('You are not a member of this workspace');
      }

      setCurrentWorkspace({ ...workspace, role: membership.role });

      // Load widgets
      const { data: widgets, error: widgetsError } = await supabase
        .from('widgets')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });

      if (widgetsError) throw widgetsError;

      console.log('📦 Loaded widgets:', widgets);
      setWidgets(widgets || []);
    } catch (error) {
      console.error('❌ Error loading workspace:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <Board workspaceId={workspaceId} />;
}
