'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hook/useDebounce';
import { useAI } from '@/hook/useAI';
import { Sparkles, Loader2, X } from 'lucide-react';

export default function NoteWidget({ widget, canEdit }) {
  const [text, setText] = useState(widget.content?.text || '');
  const [summary, setSummary] = useState(widget.content?.aiSummary || null);
  const debouncedText = useDebounce(text, 500);
  const [isSaving, setIsSaving] = useState(false);
  const isUpdatingRef = useRef(false);
  const lastSavedTextRef = useRef(widget.content?.text || '');

  const { loading: aiLoading, summarize } = useAI();

  // Update local state when widget content changes from realtime
  useEffect(() => {
    if (isUpdatingRef.current) return;

    const newText = widget.content?.text || '';
    const newSummary = widget.content?.aiSummary || null;

    if (newText !== text && newText !== lastSavedTextRef.current) {
      console.log('📝 Note widget content updated from realtime');
      setText(newText);
      lastSavedTextRef.current = newText;
    }

    // Update summary from realtime
    if (newSummary !== summary) {
      console.log('✨ AI Summary updated from realtime');
      setSummary(newSummary);
    }
  }, [widget.content?.text, widget.content?.aiSummary]);

  useEffect(() => {
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
          content: {
            text: debouncedText,
            aiSummary: summary // Preserve existing summary
          },
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

  async function handleSummarize() {
    if (!text.trim() || text.trim().length < 50) {
      alert('Please write at least 50 characters to generate a summary.');
      return;
    }

    try {
      console.log('🤖 Generating AI summary...');
      const result = await summarize(text);

      // Save summary to database so it syncs to all users
      const supabase = createClient();

      const { error } = await supabase
        .from('widgets')
        .update({
          content: {
            text: text,
            aiSummary: result
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      console.log('✅ AI summary saved and will sync to all users');
      setSummary(result);

    } catch (error) {
      console.error('❌ Failed to summarize:', error);
      alert('Failed to generate summary. Please try again.');
    }
  }

  async function handleClearSummary() {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('widgets')
        .update({
          content: {
            text: text,
            aiSummary: null
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      console.log('✅ AI summary cleared');
      setSummary(null);

    } catch (error) {
      console.error('❌ Failed to clear summary:', error);
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* AI Summary Panel */}
      {summary && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI Summary
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {summary}
              </p>
            </div>
            {canEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearSummary}
                className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Note Content */}
      <div className="flex-1 p-4 overflow-auto relative">
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

      {/* AI Actions */}
      {canEdit && text.trim().length > 50 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleSummarize}
            disabled={aiLoading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {summary ? 'Regenerate Summary' : 'Summarize with AI'}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
