import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import HabitTracker from '@/components/HabitTracker';
import DailyHighlight from '@/components/DailyHighlight';
import Timeline from '@/components/Timeline';
import ReflectionSection from '@/components/ReflectionSection';
import { useJournal } from '@/hooks/useJournal';

export default function TodayPage() {
  const { data, loading, save } = useJournal();

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-4 space-y-4 max-w-md mx-auto">
      {/* Date header */}
      <div className="pt-2 pb-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {format(new Date(data.date), 'M月d日', { locale: zhCN })}
          <span className="text-primary ml-2">
            {format(new Date(data.date), 'EEEE', { locale: zhCN })}
          </span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">{data.date}</p>
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
