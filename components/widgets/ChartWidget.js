'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export default function ChartWidget({ widget, canEdit }) {
  const [chartType, setChartType] = useState(widget.content?.type || 'line');
  const [data, setData] = useState(widget.content?.data || []);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  // Use ref to track if we're currently updating to prevent loops
  const isUpdatingRef = useRef(false);

  // Update local state when widget content changes from realtime
  useEffect(() => {
    if (isUpdatingRef.current) return; // Skip if we're the ones updating

    const newType = widget.content?.type || 'line';
    const newData = widget.content?.data || [];

    // Only update if actually different (deep comparison for data)
    const dataChanged = JSON.stringify(newData) !== JSON.stringify(data);
    const typeChanged = newType !== chartType;

    if (dataChanged || typeChanged) {
      console.log('📊 Chart widget content updated from realtime');
      setChartType(newType);
      setData(newData);
    }
  }, [widget.content?.type, widget.content?.data]); // Only depend on widget.content

  async function updateChart(updates) {
    isUpdatingRef.current = true; // Mark that we're updating

    try {
      const supabase = createClient();

      const newContent = {
        type: updates.type !== undefined ? updates.type : chartType,
        data: updates.data !== undefined ? updates.data : data,
      };

      console.log('💾 Saving chart update:', newContent);

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
      // Reset flag after a short delay to allow realtime to propagate
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 1000);
    }
  }

  async function handleTypeChange(newType) {
    setChartType(newType);
    await updateChart({ type: newType, data });
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
    await updateChart({ type: chartType, data: newData });

    setNewLabel('');
    setNewValue('');
  }

  async function deleteDataPoint(index) {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
    await updateChart({ type: chartType, data: newData });
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
