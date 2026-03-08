import { useState, useRef, useEffect } from 'react';
import { Plus, ImagePlus, Clock, Star } from 'lucide-react';
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

function TimelineItem({ 
  entry, 
  isFeatured,
  onSetFeatured 
}: { 
  entry: TimelineEntry; 
  isFeatured: boolean;
  onSetFeatured: () => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const { load } = useImageStore();

  useEffect(() => {
    if (entry.imageId) load(entry.imageId).then(setImgUrl);
  }, [entry.imageId, load]);

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
        <p className="text-sm mt-1.5 leading-relaxed">{entry.text}</p>
        {imgUrl && (
          <div className="relative mt-2">
            <img
              src={imgUrl}
              alt=""
              className="rounded-xl max-h-40 object-cover w-full"
            />
            <button
              onClick={onSetFeatured}
              className={`absolute top-2 right-2 p-1.5 rounded-full transition-all active:scale-90 ${
                isFeatured 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-black/40 text-white/80 hover:bg-black/60'
              }`}
              title="设为日历封面"
            >
              <Star className={`w-4 h-4 ${isFeatured ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Timeline({ data, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { store } = useImageStore();

  const addEntry = async () => {
    if (!text.trim()) return;
    let imageId: string | undefined;
    if (file) {
      imageId = await store(file, data.date);
    }
    
    // Build timestamp from selected time
    const [hours, minutes] = time.split(':').map(Number);
    const timestamp = new Date();
    timestamp.setHours(hours, minutes, 0, 0);
    
    const entry: TimelineEntry = {
      id: `t_${Date.now()}`,
      timestamp: timestamp.toISOString(),
      text: text.trim(),
      imageId,
    };
    onSave((prev) => ({
      ...prev,
      timeline: [...prev.timeline, entry].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    }));
    setText('');
    setTime(format(new Date(), 'HH:mm'));
    setFile(null);
    setOpen(false);
  };

  const setFeaturedImage = (imageId: string) => {
    onSave((prev) => ({
      ...prev,
      featuredImageId: prev.featuredImageId === imageId ? undefined : imageId,
    }));
  };

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border animate-fade-in">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide flex items-center gap-2">
        <span className="text-base">🕰️</span> 时间轴
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
            <TimelineItem 
              key={entry.id} 
              entry={entry} 
              isFeatured={data.featuredImageId === entry.imageId}
              onSetFeatured={() => entry.imageId && setFeaturedImage(entry.imageId)}
            />
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
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="发生了什么有趣的事？"
              autoFocus
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
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium active:scale-95 transition-all ${
                  file 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <ImagePlus className="w-4 h-4" />
                {file ? '已选择 ✓' : '添加图片'}
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
