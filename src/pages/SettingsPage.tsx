import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings, getAllDays } from '@/lib/db';
import { downloadMarkdown } from '@/lib/export';
import { AppSettings } from '@/types/journal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
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
          导出所有日记为 Markdown 文件（YYYY-MM-DD.md），图片以 ![[filename]] 格式引用。
        </p>
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
