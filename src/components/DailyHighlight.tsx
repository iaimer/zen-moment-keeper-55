import { useState, useEffect } from 'react';
import { Sparkles, Pencil } from 'lucide-react';
import { DayData } from '@/types/journal';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  data: DayData;
  onSave: (updater: (prev: DayData) => DayData) => void;
}

export default function DailyHighlight({ data, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.highlight.text);

  const hasContent = data.highlight.text.length > 0;

  useEffect(() => {
    setDraft(data.highlight.text);
  }, [data.highlight.text]);

  const handleSave = () => {
    onSave((prev) => ({
      ...prev,
      highlight: { text: draft },
    }));
    setEditing(false);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-border animate-bounce-in">
      {/* Vibrant gradient background */}
      <div className="absolute inset-0 gradient-highlight opacity-95" />

      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-white" />
          <h2 className="text-sm font-semibold text-white/90 tracking-wide">
            每日小确幸
          </h2>
        </div>

        {editing || !hasContent ? (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="今天最开心的一件事是什么？✨"
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60 min-h-[60px] text-base resize-none"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full bg-white/25 text-white text-sm font-semibold active:scale-95 transition-transform backdrop-blur-sm hover:bg-white/35"
            >
              保存 ✓
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <p className="text-lg font-display font-bold text-white leading-relaxed flex-1">
              {data.highlight.text}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="ml-2 p-2 rounded-full bg-white/20 active:scale-95 transition-transform hover:bg-white/30"
            >
              <Pencil className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
