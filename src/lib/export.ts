import { DayData } from '@/types/journal';
import { format } from 'date-fns';
import { getImage } from '@/lib/db';
import JSZip from 'jszip';

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

  const images = day.images ?? [];
  if (images.length > 0) {
    lines.push('');
    lines.push('## 📷 影像记录');
    lines.push('');
    for (const imageId of images) {
      lines.push(`![[assets/${imageId}.jpg]]`);
    }
  }

  return lines.join('\n');
}

export async function downloadMarkdown(day: DayData) {
  const images = day.images ?? [];

  if (images.length === 0) {
    // No images, just download the markdown file
    const md = generateMarkdown(day);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${day.date}.md`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // Has images — bundle into a ZIP
  const zip = new JSZip();
  zip.file(`${day.date}.md`, generateMarkdown(day));

  for (const imageId of images) {
    const img = await getImage(imageId);
    if (img) {
      zip.file(`assets/${imageId}.jpg`, img.blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${day.date}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
