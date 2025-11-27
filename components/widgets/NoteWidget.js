'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hook/useDebounce';

export default function NoteWidget({ widget, canEdit }) {
  const [text, setText] = useState(widget.content?.text || '');
  const debouncedText = useDebounce(text, 500);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when widget content changes from realtime
  useEffect(() => {
    // Only update if the text is different and we're not currently typing
    if (widget.content?.text !== text && !isSaving) {
      console.log('📝 Note widget content updated from realtime');
      setText(widget.content?.text || '');
    }
  }, [widget.content?.text]);

  useEffect(() => {
    // Save to database when debounced text changes
    if (debouncedText !== widget.content?.text && canEdit) {
      saveNote();
    }
  }, [debouncedText]);

  async function saveNote() {
    try {
      setIsSaving(true);
      const supabase = createClient();

      console.log('💾 Saving note:', debouncedText);

      const { error } = await supabase
        .from('widgets')
        .update({
          content: { text: debouncedText },
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      console.log('✅ Note saved successfully');
    } catch (error) {
      console.error('❌ Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="h-full p-4 overflow-auto relative">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing your note..."
        disabled={!canEdit}
        className="w-full h-full resize-none border-0 focus-visible:ring-0 bg-transparent"
      />
      {isSaving && (
        <div className="absolute top-2 right-2 text-xs text-gray-400">
          Saving...
        </div>
      )}
    </div>
  );
}
