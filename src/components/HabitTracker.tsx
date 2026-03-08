import { useState } from 'react';
import { Minus, Plus, Droplets, Footprints } from 'lucide-react';
import { DayData } from '@/types/journal';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface Props {
  data: DayData;
  onSave: (updater: (prev: DayData) => DayData) => void;
}

const QUICK_ADD = {
  water: [250, 500],
};

export default function HabitTracker({ data, onSave }: Props) {
  const [stepsInput, setStepsInput] = useState<string>('');

  const updateQuantified = (id: string, delta: number) => {
    onSave((prev) => ({
      ...prev,
      habits: {
        ...prev.habits,
        quantified: prev.habits.quantified.map((q) =>
          q.id === id ? { ...q, value: Math.max(0, q.value + delta) } : q
        ),
      },
    }));
  };

  const setQuantifiedValue = (id: string, value: number) => {
    onSave((prev) => ({
      ...prev,
      habits: {
        ...prev.habits,
        quantified: prev.habits.quantified.map((q) =>
          q.id === id ? { ...q, value: Math.max(0, value) } : q
        ),
      },
    }));
  };

  const toggleCheckbox = (id: string) => {
    onSave((prev) => ({
      ...prev,
      habits: {
        ...prev.habits,
        checkboxes: prev.habits.checkboxes.map((c) =>
          c.id === id ? { ...c, checked: !c.checked } : c
        ),
      },
    }));
  };

  const handleStepsSubmit = () => {
    const value = parseInt(stepsInput, 10);
    if (!isNaN(value) && value >= 0) {
      setQuantifiedValue('steps', value);
      setStepsInput('');
    }
  };

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border animate-fade-in">
      <h2 className="text-sm font-semibold text-muted-foreground mb-4 tracking-wide flex items-center gap-2">
        <span className="text-base">📋</span> 习惯追踪
      </h2>

      {/* Quantified habits */}
      <div className="space-y-4 mb-5">
        {data.habits.quantified.map((q) => {
          const isWater = q.id === 'water';
          const isSteps = q.id === 'steps';
          const quickValues = QUICK_ADD[q.id as keyof typeof QUICK_ADD] ?? [];
          
          if (isSteps) {
            // Steps: direct input mode
            return (
              <div key={q.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-steps" />
                  <span className="text-sm font-medium">{q.label}</span>
                </div>
                <div className="flex items-center gap-2 pl-7">
                  <Input
                    type="number"
                    placeholder="输入步数"
                    value={stepsInput}
                    onChange={(e) => setStepsInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStepsSubmit()}
                    className="flex-1 h-9"
                  />
                  <button
                    onClick={handleStepsSubmit}
                    className="px-4 py-2 rounded-xl gradient-steps text-white text-sm font-medium active:scale-95 transition-transform"
                  >
                    确认
                  </button>
                </div>
                {q.value > 0 && (
                  <div className="pl-7">
                    <span className="text-sm font-bold text-steps tabular-nums">
                      今日: {q.value.toLocaleString()}{q.unit}
                    </span>
                  </div>
                )}
              </div>
            );
          }
          
          // Water: quick add buttons
          return (
            <div key={q.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isWater && <Droplets className="w-5 h-5 text-water" />}
                  <span className="text-sm font-medium">{q.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantified(q.id, -q.step)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <span className="text-sm font-bold w-20 text-center tabular-nums">
                    {q.value.toLocaleString()}{q.unit}
                  </span>
                  <button
                    onClick={() => updateQuantified(q.id, q.step)}
                    className="w-8 h-8 rounded-full gradient-water flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Quick add buttons for water */}
              <div className="flex gap-2 pl-7">
                {quickValues.map((val) => (
                  <button
                    key={val}
                    onClick={() => updateQuantified(q.id, val)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 bg-water/15 text-water hover:bg-water/25"
                  >
                    +{val.toLocaleString()}{q.unit}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkbox habits */}
      <div className="space-y-2.5 border-t border-border pt-4">
        {data.habits.checkboxes.map((c) => (
          <label
            key={c.id}
            className="flex items-center gap-3 cursor-pointer active:opacity-70 transition-opacity"
          >
            <Checkbox
              checked={c.checked}
              onCheckedChange={() => toggleCheckbox(c.id)}
              className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <span className={`text-sm ${c.checked ? 'text-muted-foreground' : ''}`}>
              {c.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
