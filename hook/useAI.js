import { useState } from 'react';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function callAI(action, data) {
    setLoading(true);
    setError(null);

    try {
      console.log('🤖 Calling AI API:', action);

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'AI request failed');
      }

      console.log('✅ AI response received');
      return json.result;

    } catch (err) {
      console.error('❌ AI error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    summarize: (text) => callAI('summarize', { text }),
    suggestTasks: (tasks) => callAI('suggest-tasks', { tasks }),
    analyzeChart: (chartData, chartType) => callAI('analyze-chart', { chartData, chartType }),
    chatAssist: (messages) => callAI('chat-assist', { messages }),
  };
}
