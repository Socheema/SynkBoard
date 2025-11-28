'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import { useWidgetStore } from '@/lib/store/widgetStore';
import { useRealtimeWidgets } from '@/hook/useRealtime';
import Board from '@/components/board/Board';
import BoardSkeleton from '@/components/board/BoardSkeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setCurrentWorkspace } = useWorkspaceStore();
  const { setWidgets, reset: resetWidgets, widgets } = useWidgetStore();

  useEffect(() => {
    console.log('🚀 WorkspacePage mounted for workspace:', workspaceId);
    console.log('👤 User:', user?.id);
  }, []);

  useRealtimeWidgets(workspaceId);

  useEffect(() => {
    if (!workspaceId || !user) {
      console.log('⏳ Waiting for workspaceId and user...');
      return;
    }

    console.log('✅ WorkspaceId and user ready, loading data...');
    resetWidgets();
    loadWorkspaceData();
  }, [workspaceId, user]);

  useEffect(() => {
    console.log('📊 Current widget count:', widgets.length);
  }, [widgets.length]);

  async function loadWorkspaceData() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      console.log('📡 Fetching workspace data for:', workspaceId);

      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (workspaceError) throw workspaceError;

      console.log('✅ Workspace loaded:', workspace.name);

      const { data: membership, error: memberError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        throw new Error('You are not a member of this workspace');
      }

      console.log('✅ User role:', membership.role);
      setCurrentWorkspace({ ...workspace, role: membership.role });

      const { data: widgetsData, error: widgetsError } = await supabase
        .from('widgets')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });

      if (widgetsError) throw widgetsError;

      console.log('📦 Loaded widgets:', widgetsData?.length || 0);
      setWidgets(widgetsData || []);
    } catch (error) {
      console.error('❌ Error loading workspace:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <BoardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please check your permissions or try again later.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <Board workspaceId={workspaceId} />;
}
