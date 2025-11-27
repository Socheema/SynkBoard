'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hook/useDebounce';

export default function NoteWidget({ widget, canEdit }) {
  const [text, setText] = useState(widget.content?.text || '');
  const debouncedText = useDebounce(text, 500);
  const [isSaving, setIsSaving] = useState(false);
  const isUpdatingRef = useRef(false);
  const lastSavedTextRef = useRef(widget.content?.text || '');

  // Update local state when widget content changes from realtime
  useEffect(() => {
    if (isUpdatingRef.current) return;

    const newText = widget.content?.text || '';

    // Only update if the text is different from what we have
    if (newText !== text && newText !== lastSavedTextRef.current) {
      console.log('📝 Note widget content updated from realtime');
      setText(newText);
      lastSavedTextRef.current = newText;
    }
  }, [widget.content?.text]); // Only depend on widget.content.text

  useEffect(() => {
    // Save to database when debounced text changes
    if (debouncedText !== lastSavedTextRef.current && canEdit) {
      saveNote();
    }
  }, [debouncedText, canEdit]);

  async function saveNote() {
    isUpdatingRef.current = true;

    try {
      setIsSaving(true);
      const supabase = createClient();

      console.log('💾 Saving note');

      const { error } = await supabase
        .from('widgets')
        .update({
          content: { text: debouncedText },
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      lastSavedTextRef.current = debouncedText;
      console.log('✅ Note saved successfully');
    } catch (error) {
      console.error('❌ Error saving note:', error);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 1000);
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
