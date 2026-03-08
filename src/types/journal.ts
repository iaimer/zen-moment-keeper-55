export interface QuantifiedHabit {
  id: string;
  label: string;
  unit: string;
  value: number;
  step: number;
}

export interface CheckboxHabit {
  id: string;
  label: string;
  checked: boolean;
}

export interface HabitData {
  quantified: QuantifiedHabit[];
  checkboxes: CheckboxHabit[];
}

export interface TimelineEntry {
  id: string;
  timestamp: string; // ISO string
  text: string;
  imageId?: string;
}

export interface DailyHighlight {
  text: string;
  imageId?: string;
}

export interface ReflectionData {
  awareness: string; // 觉察和反思
  tomorrow: string;  // 明日寄语
}

export interface DayData {
  date: string; // YYYY-MM-DD
  habits: HabitData;
  highlight: DailyHighlight;
  timeline: TimelineEntry[];
  reflection: ReflectionData;
}

export interface StoredImage {
  id: string;
  blob: Blob;
  date: string;
  createdAt: string;
}

export interface AppSettings {
  customHabits: { id: string; label: string }[];
}

export const DEFAULT_QUANTIFIED_HABITS: Omit<QuantifiedHabit, 'value'>[] = [
  { id: 'water', label: '饮水量', unit: 'ml', step: 250 },
  { id: 'steps', label: '走路步数', unit: '步', step: 1000 },
];

export const DEFAULT_CHECKBOX_HABITS: { id: string; label: string }[] = [
  { id: 'language', label: '学语言' },
  { id: 'reading', label: '阅读' },
  { id: 'early-rise', label: '早起' },
];
