import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { DayData } from '@/types/journal';
import { getDayData, saveDayData, getDefaultDayData, getSettings } from '@/lib/db';

export function useJournal(date?: string) {
  const today = date ?? format(new Date(), 'yyyy-MM-dd');
  const [data, setData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const settings = await getSettings();
      let dayData = await getDayData(today);
      // Merge custom habits if day data is fresh/default
      if (!dayData.date || dayData.date !== today) {
        dayData = getDefaultDayData(today, settings);
      }
      if (!cancelled) {
        setData(dayData);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [today]);

  const save = useCallback(
    async (updater: (prev: DayData) => DayData) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        saveDayData(next);
        return next;
      });
    },
    []
  );

  return { data, loading, save, date: today };
}
