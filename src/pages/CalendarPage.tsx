import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ImageOff } from 'lucide-react';
import { getAllDays } from '@/lib/db';
import { useImageStore } from '@/hooks/useImageStore';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface PhotoItem {
  imageId: string;
  url: string;
  date: string;
}

export default function CalendarPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PhotoItem | null>(null);
  const { load } = useImageStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const allDays = await getAllDays();
      const items: PhotoItem[] = [];

      for (const day of allDays) {
        const imageIds = day.images ?? [];
        for (const imageId of imageIds) {
          const url = await load(imageId);
          if (url) {
            items.push({ imageId, url, date: day.date });
          }
        }
      }

      // Sort by date descending (newest first)
      items.sort((a, b) => b.date.localeCompare(a.date));

      if (!cancelled) {
        setPhotos(items);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [load]);

  // Group photos by month
  const grouped = photos.reduce<Record<string, PhotoItem[]>>((acc, photo) => {
    const month = photo.date.slice(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(photo);
    return acc;
  }, {});

  return (
    <div className="px-4 pt-2 pb-20 max-w-md mx-auto">
      <h1 className="text-xl font-bold py-3">📷 照片</h1>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] text-muted-foreground">
          <ImageOff className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">还没有照片</p>
          <p className="text-xs mt-1 opacity-60">在今日页面的影像记录中添加</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([month, items]) => {
            const monthDate = new Date(month + '-01');
            return (
              <div key={month}>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                  {format(monthDate, 'yyyy年M月', { locale: zhCN })}
                </h2>
                <div className="grid grid-cols-3 gap-1">
                  {items.map((photo) => (
                    <button
                      key={photo.imageId}
                      onClick={() => setSelected(photo)}
                      className="aspect-square overflow-hidden rounded-lg active:scale-95 transition-transform"
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full preview */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="rounded-2xl max-w-[90vw] p-2 bg-black/95 border-none">
          {selected && (
            <div>
              <img
                src={selected.url}
                alt=""
                className="w-full rounded-xl max-h-[70vh] object-contain"
              />
              <p className="text-center text-xs text-white/60 mt-2">
                {format(new Date(selected.date), 'yyyy年M月d日', { locale: zhCN })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
