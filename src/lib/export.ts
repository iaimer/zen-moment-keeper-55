import { DayData } from '@/types/journal';
import { format } from 'date-fns';

export function generateMarkdown(day: DayData): string {
  const lines: string[] = [];

  // Habits
  for (const q of day.habits.quantified) {
    const checked = q.value > 0 ? 'x' : ' ';
    lines.push(`- [${checked}] ${q.label}: ${q.value}${q.unit}`);
  }
  for (const c of day.habits.checkboxes) {
    const checked = c.checked ? 'x' : ' ';
    lines.push(`- [${checked}] ${c.label}`);
  }

  lines.push('');
  lines.push('## 🕰️ 时间轴');
  lines.push('');
  for (const entry of day.timeline) {
    const time = format(new Date(entry.timestamp), 'HH:mm');
    lines.push(`- **${time}** ${entry.text}`);
    if (entry.imageId) {
      lines.push(`  ![[${entry.imageId}.jpg]]`);
    }
  }

  lines.push('');
  lines.push('## ✨ 每日小确幸');
  lines.push('');
  if (day.highlight.text) {
    lines.push(day.highlight.text);
  }

  lines.push('');
  lines.push('## 🧠 觉察与反思');
  lines.push('');
  if (day.reflection.awareness) {
    lines.push(day.reflection.awareness);
  }

  lines.push('');
  lines.push('## 📝 明日寄语');
  lines.push('');
  if (day.reflection.tomorrow) {
    lines.push(day.reflection.tomorrow);
  }

  return lines.join('\n');
}

export function downloadMarkdown(day: DayData) {
  const md = generateMarkdown(day);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${day.date}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
