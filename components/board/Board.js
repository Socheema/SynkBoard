'use client';

import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { useWidgetStore } from '@/lib/store/widgetStore';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import WidgetWrapper from './WidgetWrapper';
import AddWidgetButton from './AddWidgetButton';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Board({ workspaceId }) {
  const { user } = useUser();
  const { widgets, updateLayout } = useWidgetStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    console.log('🎨 Board rendering with widgets:', widgets.length);
  }, [widgets]);

  const canEdit = currentWorkspace?.role === 'owner' || currentWorkspace?.role === 'editor';

  const layouts = {
    lg: widgets.map((widget) => ({
      i: widget.id,
      x: widget.position?.x || 0,
      y: widget.position?.y || 0,
      w: widget.position?.w || 4,
      h: widget.position?.h || 4,
      minW: 2,
      minH: 2,
    })),
  };

  async function handleLayoutChange(layout, layouts) {
    if (isDragging) return;

    const supabase = createClient();

    for (const item of layout) {
      const widget = widgets.find((w) => w.id === item.i);
      if (!widget) continue;

      const newPosition = {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      };

      if (JSON.stringify(widget.position) !== JSON.stringify(newPosition)) {
        await supabase
          .from('widgets')
          .update({ position: newPosition })
          .eq('id', item.i);
      }
    }
  }

  if (widgets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-6xl mb-4"
          >
            📋
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your board is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add your first widget to start collaborating with your team
          </p>
          <AddWidgetButton workspaceId={workspaceId} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed bottom-8 right-8 z-50">
        <AddWidgetButton workspaceId={workspaceId} />
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={canEdit}
        isResizable={canEdit}
        onLayoutChange={handleLayoutChange}
        onDragStart={() => setIsDragging(true)}
        onDragStop={() => setIsDragging(false)}
        onResizeStart={() => setIsDragging(true)}
        onResizeStop={() => setIsDragging(false)}
        draggableHandle=".widget-drag-handle"
        margin={[16, 16]}
      >
        {widgets.map((widget) => (
          <div key={widget.id}>
            <WidgetWrapper widget={widget} canEdit={canEdit} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
