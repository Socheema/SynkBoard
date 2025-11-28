'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Sparkles, Loader2, X } from 'lucide-react';
import { useAI } from '@/hook/useAI';

export default function ChartWidget({ widget, canEdit }) {
  const [chartType, setChartType] = useState(widget.content?.type || 'line');
  const [data, setData] = useState(widget.content?.data || []);
  const [aiInsights, setAiInsights] = useState(widget.content?.aiInsights || null);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const isUpdatingRef = useRef(false);
  const { loading: aiLoading, analyzeChart } = useAI();

  // Update local state when widget content changes from realtime
  useEffect(() => {
    if (isUpdatingRef.current) return;

    const newType = widget.content?.type || 'line';
    const newData = widget.content?.data || [];
    const newInsights = widget.content?.aiInsights || null;

    // Only update if actually different
    const dataChanged = JSON.stringify(newData) !== JSON.stringify(data);
    const typeChanged = newType !== chartType;
    const insightsChanged = newInsights !== aiInsights;

    if (dataChanged || typeChanged) {
      console.log('📊 Chart widget content updated from realtime');
      setChartType(newType);
      setData(newData);
    }

    if (insightsChanged) {
      console.log('✨ AI Insights updated from realtime');
      setAiInsights(newInsights);
    }
  }, [widget.content?.type, widget.content?.data, widget.content?.aiInsights]);

  async function updateChart(updates) {
    isUpdatingRef.current = true;

    try {
      const supabase = createClient();

      const newContent = {
        type: updates.type !== undefined ? updates.type : chartType,
        data: updates.data !== undefined ? updates.data : data,
        aiInsights: updates.aiInsights !== undefined ? updates.aiInsights : aiInsights,
      };

      console.log('💾 Saving chart update');

      const { error } = await supabase
        .from('widgets')
        .update({
          content: newContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) throw error;

      console.log('✅ Chart updated successfully');
    } catch (error) {
      console.error('❌ Error updating chart:', error);
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 1000);
    }
  }

  async function handleTypeChange(newType) {
    setChartType(newType);
    await updateChart({ type: newType, data, aiInsights });
  }

  async function addDataPoint(e) {
    e.preventDefault();

    if (!newLabel.trim() || !newValue.trim()) return;

    const newData = [
      ...data,
      {
        name: newLabel.trim(),
        value: parseFloat(newValue) || 0,
      },
    ];

    setData(newData);
    await updateChart({ type: chartType, data: newData, aiInsights });

    setNewLabel('');
    setNewValue('');
  }

  async function deleteDataPoint(index) {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    await updateChart({ type: chartType, data: newData, aiInsights });
  }

  async function handleAIAnalyze() {
    if (data.length < 2) {
      alert('Add at least 2 data points to analyze!');
      return;
    }

    try {
      console.log('🤖 Generating AI chart insights...');
      const result = await analyzeChart(data, chartType);

      // Save insights to database so it syncs to all users
      await updateChart({
        type: chartType,
        data,
        aiInsights: result
      });

      console.log('✅ AI insights saved and will sync to all users');
      setAiInsights(result);

    } catch (error) {
      console.error('❌ Failed to analyze chart:', error);
      alert('Failed to generate insights. Please try again.');
    }
  }

  async function handleClearInsights() {
    try {
      await updateChart({
        type: chartType,
        data,
        aiInsights: null
      });

      console.log('✅ AI insights cleared');
      setAiInsights(null);

    } catch (error) {
      console.error('❌ Failed to clear insights:', error);
    }
  }

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const DataComponent = chartType === 'line' ? Line : Bar;

  return (
    <div className="h-full flex flex-col">
      {/* Chart controls */}
      {canEdit && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex gap-2">
          <Select value={chartType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* AI Insights Panel */}
      {aiInsights && (
        <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI Insights
              </p>
              <p className="text-sm text-green-900 dark:text-green-100">
                {aiInsights}
              </p>
            </div>
            {canEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearInsights}
                className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Chart display */}
      <div className="flex-1 p-4 overflow-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No data yet. Add some below!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <DataComponent type="monotone" dataKey="value" fill="#8884d8" stroke="#8884d8" />
            </ChartComponent>
          </ResponsiveContainer>
        )}
      </div>

      {/* AI Analyze Button */}
      {canEdit && data.length >= 2 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleAIAnalyze}
            disabled={aiLoading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Data...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {aiInsights ? 'Regenerate Insights' : 'AI Analyze Data'}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Add data form */}
      {canEdit && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={addDataPoint} className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label (e.g., Jan)"
                className="flex-1"
              />
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Value (e.g., 100)"
                type="number"
                className="w-24"
              />
              <Button type="submit" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Data points list */}
          {data.length > 0 && (
            <div className="mt-3 space-y-1 max-h-24 overflow-auto">
              {data.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {point.name}: {point.value}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteDataPoint(index)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
