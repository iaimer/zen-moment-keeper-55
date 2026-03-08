import { useState } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HabitTracker from '@/components/HabitTracker';
import DailyHighlight from '@/components/DailyHighlight';
import Timeline from '@/components/Timeline';
import ReflectionSection from '@/components/ReflectionSection';
import { useJournal } from '@/hooks/useJournal';

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { data, loading, save } = useJournal(dateStr);

  const goToday = () => setSelectedDate(new Date());
  const goPrev = () => setSelectedDate(subDays(selectedDate, 1));
  const goNext = () => setSelectedDate(addDays(selectedDate, 1));

  const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-4 space-y-4 max-w-md mx-auto">
      {/* Date header with navigation */}
      <div className="pt-2 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              className="p-2 rounded-xl bg-muted active:scale-90 transition-transform"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={goToday}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isToday 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-primary/20'
              }`}
            >
              今天
            </button>
            <button
              onClick={goNext}
              className="p-2 rounded-xl bg-muted active:scale-90 transition-transform"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mt-3">
          {format(selectedDate, 'M月d日', { locale: zhCN })}
          <span className="text-primary ml-2">
            {format(selectedDate, 'EEEE', { locale: zhCN })}
          </span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">{dateStr}</p>
      </div>

      <HabitTracker data={data} onSave={save} />
      <DailyHighlight data={data} onSave={save} />
      <Timeline data={data} onSave={save} />
      <ReflectionSection data={data} onSave={save} />

      {/* Bottom spacing for nav */}
      <div className="h-20" />
    </div>
  );
}
