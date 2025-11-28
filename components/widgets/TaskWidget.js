'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Sparkles, Loader2, X } from 'lucide-react';
import { useAI } from '@/hook/useAI';

export default function TaskWidget({ widget, canEdit }) {
  const [tasks, setTasks] = useState(widget.content?.tasks || []);
  const [aiSuggestions, setAiSuggestions] = useState(widget.content?.aiSuggestions || null);
  const [newTask, setNewTask] = useState('');
  const isUpdatingRef = useRef(false);

  const { loading: aiLoading, suggestTasks: aiSuggestTasks } = useAI();

  // Update local state when widget content changes from realtime
  useEffect(() => {
    if (isUpdatingRef.current) return;

    const newTasks = widget.content?.tasks || [];
    const newSuggestions = widget.content?.aiSuggestions || null;

    // Only update if actually different
    if (JSON.stringify(newTasks) !== JSON.stringify(tasks)) {
      console.log('✅ Task widget content updated from realtime');
      setTasks(newTasks);
    }

    // Update AI suggestions from realtime
    if (newSuggestions !== aiSuggestions) {
      console.log('✨ AI Suggestions updated from realtime');
      setAiSuggestions(newSuggestions);
    }
  }, [widget.content?.tasks, widget.content?.aiSuggestions]);

  async function updateTasks(updatedTasks, preserveSuggestions = true) {
    isUpdatingRef.current = true;
    setTasks(updatedTasks);

    try {
      const supabase = createClient();

      console.log('💾 Saving tasks:', updatedTasks.length);

      const { error } = await supabase
        .from('widgets')
        .update({
          content: {
            tasks: updatedTasks,
            aiSuggestions: preserveSuggestions ? aiSuggestions : null
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      console.log('✅ Tasks updated successfully');
    } catch (error) {
      console.error('❌ Error updating tasks:', error);
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 1000);
    }
  }

  async function addTask(e) {
    e.preventDefault();

    if (!newTask.trim()) return;

    const newTaskObj = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await updateTasks([...tasks, newTaskObj]);
    setNewTask('');
  }

  async function toggleTask(taskId) {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    await updateTasks(updatedTasks);
  }

  async function deleteTask(taskId) {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    await updateTasks(updatedTasks);
  }

  async function handleAISuggest() {
    if (tasks.length === 0) {
      alert('Add at least one task first!');
      return;
    }

    try {
      console.log('🤖 Generating AI task suggestions...');
      const result = await aiSuggestTasks(tasks);

      // Save suggestions to database so it syncs to all users
      const supabase = createClient();

      const { error } = await supabase
        .from('widgets')
        .update({
          content: {
            tasks: tasks,
            aiSuggestions: result
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      console.log('✅ AI suggestions saved and will sync to all users');
      setAiSuggestions(result);

    } catch (error) {
      console.error('❌ Failed to get suggestions:', error);
      alert('Failed to generate suggestions. Please try again.');
    }
  }

  async function handleClearSuggestions() {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('widgets')
        .update({
          content: {
            tasks: tasks,
            aiSuggestions: null
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      console.log('✅ AI suggestions cleared');
      setAiSuggestions(null);

    } catch (error) {
      console.error('❌ Failed to clear suggestions:', error);
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header with progress */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {completedCount} of {tasks.length} completed
        </div>
        {tasks.length > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* AI Suggestions Panel */}
      {aiSuggestions && (
        <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Suggested Tasks
            </p>
            {canEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearSuggestions}
                className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="text-sm text-purple-900 dark:text-purple-100 whitespace-pre-line">
            {aiSuggestions}
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No tasks yet. Add one below!
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 group"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                disabled={!canEdit}
              />
              <span
                className={`flex-1 ${
                  task.completed
                    ? 'line-through text-gray-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {task.text}
              </span>
              {canEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* AI Button */}
      {canEdit && tasks.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleAISuggest}
            disabled={aiLoading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Suggestions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {aiSuggestions ? 'Regenerate Suggestions' : 'AI Task Suggestions'}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Add task form */}
      {canEdit && (
        <form onSubmit={addTask} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

