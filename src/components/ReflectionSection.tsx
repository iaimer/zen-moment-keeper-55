import { DayData } from '@/types/journal';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface Props {
  data: DayData;
  onSave: (updater: (prev: DayData) => DayData) => void;
}

export default function ReflectionSection({ data, onSave }: Props) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border animate-fade-in space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2 tracking-wide">
          🧠 觉察与反思
        </h2>
        <Textarea
          value={data.reflection.awareness}
          onChange={(e) =>
            onSave((prev) => ({
              ...prev,
              reflection: { ...prev.reflection, awareness: e.target.value },
            }))
          }
          placeholder="今天你注意到了什么？有什么反思？"
          className="min-h-[80px] text-sm bg-background"
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2 tracking-wide">
          📝 明日寄语
        </h2>
        <Input
          value={data.reflection.tomorrow}
          onChange={(e) =>
            onSave((prev) => ({
              ...prev,
              reflection: { ...prev.reflection, tomorrow: e.target.value },
            }))
          }
          placeholder="给明天的自己说一句话..."
          className="text-sm bg-background"
        />
      </div>
    </div>
  );
}
