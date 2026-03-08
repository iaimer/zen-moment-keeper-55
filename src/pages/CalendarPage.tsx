import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllDays } from '@/lib/db';
import { useImageStore } from '@/hooks/useImageStore';
import { DayData } from '@/types/journal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DayCell {
  date: Date;
  data?: DayData;
  imageUrl?: string;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cells, setCells] = useState<DayCell[]>([]);
  const [selected, setSelected] = useState<DayCell | null>(null);
  const { load } = useImageStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const allDays = await getAllDays();
      const dayMap = new Map(allDays.map((d) => [d.date, d]));
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const days = eachDayOfInterval({ start, end });

      const results: DayCell[] = [];
      for (const date of days) {
        const key = format(date, 'yyyy-MM-dd');
        const data = dayMap.get(key);
        let imageUrl: string | undefined;
        if (data?.highlight?.imageId) {
          const url = await load(data.highlight.imageId);
          if (url) imageUrl = url;
        }
        results.push({ date, data, imageUrl });
      }

      if (!cancelled) setCells(results);
    })();
    return () => { cancelled = true; };
  }, [currentMonth, load]);

  const startDay = getDay(startOfMonth(currentMonth));
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="px-4 pt-2 pb-20 max-w-md mx-auto">
      {/* Month navigation */}
      <div className="flex items-center justify-between py-3">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-xl active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-lg font-bold">
          {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
        </h1>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-xl active:scale-90 transition-transform"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-[11px] text-muted-foreground font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {cells.map((cell) => {
          const today = isToday(cell.date);
          const hasHighlight = !!cell.data?.highlight?.text;

          return (
            <button
              key={cell.date.toISOString()}
              onClick={() => hasHighlight ? setSelected(cell) : null}
              className={`aspect-square rounded-xl relative overflow-hidden flex items-end justify-center p-0.5 transition-all active:scale-90 ${
                today ? 'ring-2 ring-primary' : ''
              } ${hasHighlight ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {cell.imageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${cell.imageUrl})` }}
                />
              ) : (
                <div className={`absolute inset-0 ${hasHighlight ? 'bg-primary/10' : 'bg-secondary/50'}`} />
              )}
              <span
                className={`relative text-[11px] font-semibold z-10 ${
                  cell.imageUrl ? 'text-white drop-shadow-md' : today ? 'text-primary' : 'text-foreground'
                }`}
              >
                {format(cell.date, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preview dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="rounded-2xl max-w-[85vw]">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {format(selected.date, 'M月d日 EEEE', { locale: zhCN })}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {selected.imageUrl && (
                  <img
                    src={selected.imageUrl}
                    alt=""
                    className="w-full rounded-xl max-h-48 object-cover"
                  />
                )}
                <div className="gradient-highlight rounded-xl p-4">
                  <p className="text-base font-display font-bold text-primary-foreground">
                    ✨ {selected.data?.highlight?.text}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
