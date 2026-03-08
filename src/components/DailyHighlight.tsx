import { useState, useEffect, useRef } from 'react';
import { Sparkles, Camera, Pencil } from 'lucide-react';
import { DayData } from '@/types/journal';
import { useImageStore } from '@/hooks/useImageStore';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  data: DayData;
  onSave: (updater: (prev: DayData) => DayData) => void;
}

export default function DailyHighlight({ data, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.highlight.text);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { store, load } = useImageStore();

  const hasContent = data.highlight.text.length > 0;

  useEffect(() => {
    setDraft(data.highlight.text);
  }, [data.highlight.text]);

  useEffect(() => {
    if (data.highlight.imageId) {
      load(data.highlight.imageId).then(setImageUrl);
    }
  }, [data.highlight.imageId, load]);

  const handleSave = () => {
    onSave((prev) => ({
      ...prev,
      highlight: { ...prev.highlight, text: draft },
    }));
    setEditing(false);
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = await store(file, data.date);
    onSave((prev) => ({
      ...prev,
      highlight: { ...prev.highlight, imageId: id },
    }));
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-border animate-fade-in">
      {/* Background */}
      <div className="absolute inset-0 gradient-highlight opacity-90" />
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
          <h2 className="text-sm font-semibold text-primary-foreground/90 tracking-wide">
            每日小确幸
          </h2>
        </div>

        {editing || !hasContent ? (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="今天最重要的一件事..."
              className="bg-white/20 border-white/30 text-primary-foreground placeholder:text-primary-foreground/50 min-h-[60px] text-base"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-full bg-white/25 text-primary-foreground text-sm font-medium active:scale-95 transition-transform"
              >
                保存
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="p-1.5 rounded-full bg-white/25 active:scale-95 transition-transform"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <p className="text-lg font-display font-bold text-primary-foreground leading-relaxed flex-1">
              {data.highlight.text}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="ml-2 p-1.5 rounded-full bg-white/20 active:scale-95 transition-transform"
            >
              <Pencil className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
