import { useState, useRef, useEffect } from 'react';
import { Plus, ImagePlus } from 'lucide-react';
import { format } from 'date-fns';
import { DayData, TimelineEntry } from '@/types/journal';
import { useImageStore } from '@/hooks/useImageStore';
import { Input } from '@/components/ui/input';
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
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const { load } = useImageStore();

  useEffect(() => {
    if (entry.imageId) load(entry.imageId).then(setImgUrl);
  }, [entry.imageId, load]);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
        <div className="w-0.5 flex-1 bg-border" />
      </div>
      <div className="pb-4 flex-1">
        <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
          {format(new Date(entry.timestamp), 'HH:mm')}
        </span>
        <p className="text-sm mt-0.5">{entry.text}</p>
        {imgUrl && (
          <img
            src={imgUrl}
            alt=""
            className="mt-2 rounded-xl max-h-40 object-cover w-full"
          />
        )}
      </div>
    </div>
  );
}

export default function Timeline({ data, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { store } = useImageStore();

  const addEntry = async () => {
    if (!text.trim()) return;
    let imageId: string | undefined;
    if (file) {
      imageId = await store(file, data.date);
    }
    const entry: TimelineEntry = {
      id: `t_${Date.now()}`,
      timestamp: new Date().toISOString(),
      text: text.trim(),
      imageId,
    };
    onSave((prev) => ({
      ...prev,
      timeline: [...prev.timeline, entry],
    }));
    setText('');
    setFile(null);
    setOpen(false);
  };

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border animate-fade-in">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide">
        🕰️ 时间轴
      </h2>

      {data.timeline.length === 0 ? (
        <p className="text-xs text-muted-foreground/70 text-center py-4">
          还没有记录，点击下方按钮添加
        </p>
      ) : (
        <div>
          {data.timeline.map((entry) => (
            <TimelineItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl bg-primary shadow-lg flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>添加记录</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="发生了什么..."
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm text-secondary-foreground active:scale-95 transition-transform"
              >
                <ImagePlus className="w-4 h-4" />
                {file ? '已选择' : '添加图片'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <button
              onClick={addEntry}
              disabled={!text.trim()}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              添加
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
