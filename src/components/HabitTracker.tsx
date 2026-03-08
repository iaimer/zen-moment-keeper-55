import { Minus, Plus, Droplets, Footprints } from 'lucide-react';
import { DayData } from '@/types/journal';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  data: DayData;
  onSave: (updater: (prev: DayData) => DayData) => void;
}

const QUICK_ADD = {
  water: [250, 500],
  steps: [1000, 5000],
};

export default function HabitTracker({ data, onSave }: Props) {
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
          
          return (
            <div key={q.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isWater && <Droplets className="w-5 h-5 text-water" />}
                  {isSteps && <Footprints className="w-5 h-5 text-steps" />}
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform ${
                      isWater ? 'gradient-water' : isSteps ? 'gradient-steps' : 'bg-primary'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Quick add buttons */}
              <div className="flex gap-2 pl-7">
                {quickValues.map((val) => (
                  <button
                    key={val}
                    onClick={() => updateQuantified(q.id, val)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                      isWater 
                        ? 'bg-water/15 text-water hover:bg-water/25' 
                        : 'bg-steps/15 text-steps hover:bg-steps/25'
                    }`}
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
            <span className={`text-sm ${c.checked ? 'line-through text-muted-foreground' : ''}`}>
              {c.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
