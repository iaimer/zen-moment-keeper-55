import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Download, ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings, getAllDays, getDayData } from '@/lib/db';
import { downloadMarkdown } from '@/lib/export';
import { AppSettings } from '@/types/journal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [exportDate, setExportDate] = useState<Date>(new Date());
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const addHabit = async () => {
    if (!newHabit.trim() || !settings) return;
    const updated: AppSettings = {
      ...settings,
      customHabits: [
        ...settings.customHabits,
        { id: `h_${Date.now()}`, label: newHabit.trim() },
      ],
    };
    await saveSettings(updated);
    setSettings(updated);
    setNewHabit('');
    toast.success('已添加');
  };

  const removeHabit = async (id: string) => {
    if (!settings) return;
    const updated: AppSettings = {
      ...settings,
      customHabits: settings.customHabits.filter((h) => h.id !== id),
    };
    await saveSettings(updated);
    setSettings(updated);
    toast.success('已删除');
  };

  const exportSingleDay = async () => {
    const dateStr = format(exportDate, 'yyyy-MM-dd');
    const dayData = await getDayData(dateStr);
    if (!dayData.timeline.length && !dayData.highlight.text && !dayData.reflection.awareness) {
      toast.error('该日期没有数据可导出');
      return;
    }
    downloadMarkdown(dayData);
    toast.success(`已导出 ${dateStr} 的记录`, {
      description: '图片请手动从应用中保存至 Obsidian 附件目录',
    });
  };

  const exportAll = async () => {
    const days = await getAllDays();
    if (days.length === 0) {
      toast.error('没有数据可导出');
      return;
    }
    days.forEach(downloadMarkdown);
    toast.success(`已导出 ${days.length} 天的记录`, {
      description: '图片请手动从应用中保存至 Obsidian 附件目录',
    });
  };

  if (!settings) return null;

  return (
    <div className="px-4 pt-2 pb-20 max-w-md mx-auto">
      <div className="flex items-center gap-3 py-3">
        <button onClick={() => navigate(-1)} className="p-1 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">设置</h1>
      </div>

      {/* Custom habits */}
      <section className="rounded-2xl bg-card p-4 shadow-sm border border-border mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          自定义习惯项
        </h2>
        <div className="space-y-2 mb-3">
          {settings.customHabits.map((h) => (
            <div key={h.id} className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-secondary/50">
              <span className="text-sm">{h.label}</span>
              <button
                onClick={() => removeHabit(h.id)}
                className="p-1 text-destructive active:scale-90 transition-transform"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="新习惯名称..."
            className="text-sm"
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          />
          <Button size="icon" onClick={addHabit} className="shrink-0 rounded-xl">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Export */}
      <section className="rounded-2xl bg-card p-4 shadow-sm border border-border mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          Obsidian 导出
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          导出日记为 Markdown 文件（YYYY-MM-DD.md），图片以 ![[filename]] 格式引用。
        </p>
        
        {/* Single day export */}
        <div className="flex gap-2 mb-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1 rounded-xl justify-start gap-2">
                <Calendar className="w-4 h-4" />
                {format(exportDate, 'yyyy-MM-dd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={exportDate}
                onSelect={(date) => date && setExportDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={exportSingleDay} className="rounded-xl gap-2">
            <Download className="w-4 h-4" />
            导出
          </Button>
        </div>
        
        <Button onClick={exportAll} variant="outline" className="w-full rounded-xl gap-2">
          <Download className="w-4 h-4" />
          导出全部日记
        </Button>
      </section>

      {/* Data management */}
      <section className="rounded-2xl bg-card p-4 shadow-sm border border-border">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          数据管理
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          所有数据保存在浏览器本地（IndexedDB），清除浏览器数据会丢失记录。
        </p>
        <Button
          variant="destructive"
          className="w-full rounded-xl"
          onClick={() => {
            if (confirm('确认清除所有数据？此操作不可撤销。')) {
              indexedDB.deleteDatabase('zenjournal');
              toast.success('数据已清除');
              setTimeout(() => window.location.reload(), 500);
            }
          }}
        >
          清除所有数据
        </Button>
      </section>
    </div>
  );
}
