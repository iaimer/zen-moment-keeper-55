import { useState, useRef, useCallback } from 'react';
import { Plus, Clock, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { DayData, TimelineEntry } from '@/types/journal';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  data: DayData;
  onSave: (updater: (prev: DayData) => DayData) => void;
}

function TimelineItem({ entry, onEdit, onDelete }: { entry: TimelineEntry; onEdit: () => void; onDelete: () => void }) {
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);
  const locked = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    swiping.current = true;
    locked.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!locked.current) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        swiping.current = false;
        setOffsetX(0);
        return;
      }
      if (Math.abs(dx) > 8) {
        locked.current = true;
      }
      return;
    }

    const clamped = Math.max(-120, Math.min(0, dx));
    setOffsetX(clamped);
  }, []);

  const onTouchEnd = useCallback(() => {
    swiping.current = false;
    locked.current = false;
    setOffsetX((prev) => (prev < -50 ? -120 : 0));
  }, []);

  const closeSwipe = () => setOffsetX(0);

  return (
    <div className="relative overflow-hidden rounded-xl mb-1">
      {/* Action buttons behind */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          onClick={() => { closeSwipe(); onEdit(); }}
          className="w-[60px] flex items-center justify-center bg-primary/90 text-primary-foreground active:bg-primary"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => { closeSwipe(); onDelete(); }}
          className="w-[60px] flex items-center justify-center bg-destructive text-destructive-foreground active:bg-destructive/80"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Foreground content */}
      <div
        className="flex gap-3 group relative bg-card z-10 transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-primary mt-1.5 ring-4 ring-primary/20" />
          <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/30 to-transparent" />
        </div>
        <div className="pb-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-medium tabular-nums bg-muted px-2 py-0.5 rounded-full">
              {format(new Date(entry.timestamp), 'HH:mm')}
            </span>
            {/* Desktop hover buttons */}
            <div className="hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted active:scale-90 transition-all">
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-destructive/10 active:scale-90 transition-all">
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          </div>
          <p className="text-sm mt-1.5 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
        </div>
      </div>
    </div>
  );
}

export default function Timeline({ data, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setEditingId(null);
    setText('');
    setTime(format(new Date(), 'HH:mm'));
    setOpen(true);
  };

  const openEdit = (entry: TimelineEntry) => {
    setEditingId(entry.id);
    setText(entry.text);
    setTime(format(new Date(entry.timestamp), 'HH:mm'));
    setOpen(true);
  };

  const handleSave = () => {
    if (!text.trim()) return;

    const [hours, minutes] = time.split(':').map(Number);
    const timestamp = new Date();
    timestamp.setHours(hours, minutes, 0, 0);

    if (editingId) {
      onSave((prev) => ({
        ...prev,
        timeline: prev.timeline
          .map((e) => e.id === editingId ? { ...e, text: text.trim(), timestamp: timestamp.toISOString() } : e)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      }));
    } else {
      const entry: TimelineEntry = {
        id: `t_${Date.now()}`,
        timestamp: timestamp.toISOString(),
        text: text.trim(),
      };
      onSave((prev) => ({
        ...prev,
        timeline: [...prev.timeline, entry].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
      }));
    }
    setText('');
    setEditingId(null);
    setOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    onSave((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((e) => e.id !== deleteId),
    }));
    setDeleteId(null);
  };

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border animate-fade-in">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide flex items-center gap-2">
        ✍️ 随手记 & 灵感
      </h2>

      {data.timeline.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground/70">还没有记录 ✍️</p>
          <p className="text-xs text-muted-foreground/50 mt-1">点击右下角按钮添加</p>
        </div>
      ) : (
        <div>
          {data.timeline.map((entry) => (
            <TimelineItem
              key={entry.id}
              entry={entry}
              onEdit={() => openEdit(entry)}
              onDelete={() => setDeleteId(entry.id)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl gradient-highlight shadow-lg shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>✏️</span> {editingId ? '编辑记录' : '添加记录'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="发生了什么有趣的事？"
              autoFocus
              rows={3}
              className="resize-none"
            />
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
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className="w-full py-3 rounded-xl gradient-highlight text-white font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              {editingId ? '保存修改 ✅' : '添加记录 🎉'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl max-w-[85vw]">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>删除后无法恢复，确定要删除这条记录吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
