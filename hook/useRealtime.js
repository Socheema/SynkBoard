import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useWidgetStore } from '@/lib/store/widgetStore';

export function useRealtimeWidgets(workspaceId) {
  const { setWidgets, addWidget, updateWidget, deleteWidget } = useWidgetStore();

  useEffect(() => {
    if (!workspaceId) return;

    const supabase = createClient();

    console.log('🔌 Setting up realtime subscription for workspace:', workspaceId);

    // Subscribe to widget changes
    const channel = supabase
      .channel(`workspace:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'widgets',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('✅ Widget inserted:', payload.new);
          addWidget(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'widgets',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('✅ Widget updated:', payload.new);
          updateWidget(payload.new.id, payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'widgets',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('✅ Widget deleted:', payload.old);
          deleteWidget(payload.old.id);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    // Cleanup on unmount or workspace change
    return () => {
      console.log('🔌 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [workspaceId, addWidget, updateWidget, deleteWidget]);
}
