'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useWidgetStore } from '@/lib/store/widgetStore';
import { GripVertical, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import NoteWidget from '@/components/widgets/NoteWidget';
import TaskWidget from '@/components/widgets/TaskWidget';
import ChartWidget from '@/components/widgets/ChartWidget';
import ChatWidget from '@/components/widgets/ChatWidget';

const widgetComponents = {
  note: NoteWidget,
  task: TaskWidget,
  chart: ChartWidget,
  chat: ChatWidget,
};

function WidgetWrapper({ widget, canEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteWidget = useWidgetStore((state) => state.deleteWidget);

  const WidgetComponent = widgetComponents[widget.type];

  async function handleDelete() {
    try {
      setIsDeleting(true);
      console.log('🗑️ Deleting widget from UI:', widget.id);

      const supabase = createClient();

      const { error } = await supabase
        .from('widgets')
        .delete()
        .eq('id', widget.id);

      if (error) throw error;

      console.log('✅ Widget deleted from database:', widget.id);
      deleteWidget(widget.id);
      toast.success('Widget deleted');

    } catch (error) {
      console.error('❌ Error deleting widget:', error);
      toast.error('Failed to delete widget');
      setIsDeleting(false);
    }
  }

  if (isDeleting) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={widget.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              {canEdit && (
                <div className="widget-drag-handle cursor-move">
                  <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}
              </span>
            </div>

            {canEdit && (
              <div className="flex items-center gap-1">
                {showDeleteConfirm ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="h-7 px-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDelete}
                      className="h-7 px-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-7 px-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {WidgetComponent ? (
              <WidgetComponent widget={widget} canEdit={canEdit} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Unknown widget type
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(WidgetWrapper, (prevProps, nextProps) => {
  return (
    prevProps.widget.id === nextProps.widget.id &&
    prevProps.canEdit === nextProps.canEdit &&
    JSON.stringify(prevProps.widget.content) === JSON.stringify(nextProps.widget.content) &&
    JSON.stringify(prevProps.widget.position) === JSON.stringify(nextProps.widget.position)
  );
});
