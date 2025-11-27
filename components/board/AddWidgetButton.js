'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { useWidgetStore } from '@/lib/store/widgetStore';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, FileText, CheckSquare, BarChart3, MessageSquare } from 'lucide-react';

const widgetTypes = [
  { type: 'note', label: 'Note', icon: FileText, color: 'text-blue-600' },
  { type: 'task', label: 'Task List', icon: CheckSquare, color: 'text-green-600' },
  { type: 'chart', label: 'Chart', icon: BarChart3, color: 'text-purple-600' },
  { type: 'chat', label: 'Chat', icon: MessageSquare, color: 'text-orange-600' },
];

export default function AddWidgetButton({ workspaceId }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const { widgets } = useWidgetStore();
  const { currentWorkspace } = useWorkspaceStore();

  const canEdit = currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'editor';

  if (!canEdit) return null;

  async function handleAddWidget(type) {
    try {
      setLoading(true);
      const supabase = createClient();

      // Find empty position on grid
      const maxY = widgets.length > 0
        ? Math.max(...widgets.map(w => (w.position?.y || 0) + (w.position?.h || 4)))
        : 0;

      const newWidget = {
        workspace_id: workspaceId,
        type,
        content: getDefaultContent(type),
        position: {
          x: 0,
          y: maxY,
          w: type === 'chat' ? 4 : 6,
          h: type === 'chart' ? 6 : 4,
        },
        created_by: user.id,
      };

      const { error } = await supabase
        .from('widgets')
        .insert(newWidget);

      if (error) throw error;

      // Widget will be added via realtime subscription
    } catch (error) {
      console.error('Error adding widget:', error);
    } finally {
      setLoading(false);
    }
  }

  function getDefaultContent(type) {
    switch (type) {
      case 'note':
        return { text: '' };
      case 'task':
        return { tasks: [] };
      case 'chart':
        return {
          type: 'line',
          data: []
        };
      case 'chat':
        return {};
      default:
        return {};
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          disabled={loading}
          className="rounded-full shadow-lg h-14 w-14 p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Add Widget</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {widgetTypes.map(({ type, label, icon: Icon, color }) => (
          <DropdownMenuItem
            key={type}
            onClick={() => handleAddWidget(type)}
            className="cursor-pointer"
          >
            <Icon className={`h-4 w-4 mr-2 ${color}`} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
