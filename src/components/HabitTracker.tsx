import { Minus, Plus, Droplets, Footprints } from 'lucide-react';
import { DayData, QuantifiedHabit, CheckboxHabit } from '@/types/journal';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  data: DayData;
  onSave: (updater: (prev: DayData) => DayData) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  water: <Droplets className="w-4 h-4 text-primary" />,
  steps: <Footprints className="w-4 h-4 text-primary" />,
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
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide">
        📋 习惯追踪
      </h2>

      {/* Quantified habits */}
      <div className="space-y-3 mb-4">
        {data.habits.quantified.map((q) => (
          <div key={q.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ICONS[q.id] ?? null}
              <span className="text-sm font-medium">{q.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantified(q.id, -q.step)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
              >
                <Minus className="w-3.5 h-3.5 text-secondary-foreground" />
              </button>
              <span className="text-sm font-semibold w-20 text-center tabular-nums">
                {q.value}{q.unit}
              </span>
              <button
                onClick={() => updateQuantified(q.id, q.step)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform"
              >
                <Plus className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkbox habits */}
      <div className="space-y-2.5">
        {data.habits.checkboxes.map((c) => (
          <label
            key={c.id}
            className="flex items-center gap-3 cursor-pointer active:opacity-70 transition-opacity"
          >
            <Checkbox
              checked={c.checked}
              onCheckedChange={() => toggleCheckbox(c.id)}
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
