import { useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { DayData, TimelineEntry } from '@/types/journal';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  data: DayData;
  onSave: (updater: (prev: DayData) => DayData) => void;
}

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-primary mt-1.5 ring-4 ring-primary/20" />
        <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/30 to-transparent" />
      </div>
      <div className="pb-4 flex-1">
        <span className="text-[11px] text-muted-foreground font-medium tabular-nums bg-muted px-2 py-0.5 rounded-full">
          {format(new Date(entry.timestamp), 'HH:mm')}
        </span>
        <p className="text-sm mt-1.5 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
      </div>
    </div>
  );
}

export default function Timeline({ data, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));

  const addEntry = () => {
    if (!text.trim()) return;
    
    const [hours, minutes] = time.split(':').map(Number);
    const timestamp = new Date();
    timestamp.setHours(hours, minutes, 0, 0);
    
    const entry: TimelineEntry = {
      id: `t_${Date.now()}`,
      timestamp: timestamp.toISOString(),
      text: text.trim(),
    };
    onSave((prev) => ({
      ...prev,
      timeline: [...prev.timeline, entry].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    }));
    setText('');
    setTime(format(new Date(), 'HH:mm'));
    setOpen(false);
  };

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border animate-fade-in">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide flex items-center gap-2">
        ✍️ 随手记 & 灵感
      </h2>

      {data.timeline.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground/70">
            还没有记录 ✍️
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            点击右下角按钮添加
          </p>
        </div>
      ) : (
        <div>
          {data.timeline.map((entry) => (
            <TimelineItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => {
          setTime(format(new Date(), 'HH:mm'));
          setOpen(true);
        }}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl gradient-highlight shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>✏️</span> 添加记录
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="发生了什么有趣的事？"
              autoFocus
              rows={3}
              className="resize-none"
            />
            
            {/* Time picker */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-xs text-muted-foreground">可修改时间</span>
            </div>
            
            <button
              onClick={addEntry}
              disabled={!text.trim()}
              className="w-full py-3 rounded-xl gradient-highlight text-white font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              添加记录 🎉
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
