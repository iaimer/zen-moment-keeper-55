import { useCallback } from 'react';
import { saveImage, getImage } from '@/lib/db';
import { StoredImage } from '@/types/journal';
import { format } from 'date-fns';

export function useImageStore() {
  const store = useCallback(async (file: File, date?: string): Promise<string> => {
    const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const stored: StoredImage = {
      id,
      blob: file,
      date: date ?? format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
    };
    await saveImage(stored);
    return id;
  }, []);

  const load = useCallback(async (id: string): Promise<string | null> => {
    const img = await getImage(id);
    if (!img) return null;
    return URL.createObjectURL(img.blob);
  }, []);

  return { store, load };
}
