import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useWidgetStore } from '@/lib/store/widgetStore';

export function useRealtimeWidgets(workspaceId) {
  const { addWidget, updateWidget, deleteWidget } = useWidgetStore();
  const channelRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) {
      console.log('⚠️ No workspaceId provided, skipping realtime setup');
      return;
    }

    console.log('🔌 Setting up realtime subscription for workspace:', workspaceId);

    const supabase = createClient();

    // Clean up existing channel if any
    if (channelRef.current) {
      console.log('🧹 Cleaning up existing channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create channel with specific configuration
    const channel = supabase
      .channel(`workspace-${workspaceId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: '' },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'widgets',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('✅ [INSERT] Widget created:', payload.new.id);
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
          console.log('✅ [UPDATE] Widget updated:', payload.new.id);
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
          console.log('✅ [DELETE] Widget deleted:', payload.old);

          if (!payload.old || !payload.old.id) {
            console.error('❌ DELETE payload missing id:', payload);
            return;
          }

          console.log('🗑️ Removing widget from store:', payload.old.id);
          deleteWidget(payload.old.id);
        }
      )
      .on('system', {}, (payload) => {
        console.log('🔔 System event:', payload);
      })
      .subscribe((status, err) => {
        console.log('📡 Subscription status:', status);

        if (err) {
          console.error('❌ Subscription error:', err);
        }

        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error - realtime not working');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Subscription timed out - retrying...');
          // Retry logic
          setTimeout(() => {
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
          }, 1000);
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up realtime subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [workspaceId, addWidget, updateWidget, deleteWidget]);
}
