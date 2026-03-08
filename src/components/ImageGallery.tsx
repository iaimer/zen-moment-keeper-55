import { useState, useRef, useEffect } from 'react';
import { ImagePlus, Star, X } from 'lucide-react';
import { DayData } from '@/types/journal';
import { useImageStore } from '@/hooks/useImageStore';

interface Props {
  data: DayData;
  onSave: (updater: (prev: DayData) => DayData) => void;
}

function GalleryImage({
  imageId,
  isFeatured,
  onSetFeatured,
  onRemove,
}: {
  imageId: string;
  isFeatured: boolean;
  onSetFeatured: () => void;
  onRemove: () => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const { load } = useImageStore();

  useEffect(() => {
    load(imageId).then(setImgUrl);
  }, [imageId, load]);

  if (!imgUrl) return null;

  return (
    <div className="relative group">
      <img
        src={imgUrl}
        alt=""
        className="rounded-xl w-full aspect-square object-cover"
      />
      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onSetFeatured}
          className={`p-1.5 rounded-full transition-all active:scale-90 ${
            isFeatured
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-black/40 text-white/80 hover:bg-black/60'
          }`}
          title="设为日历封面"
        >
          <Star className={`w-4 h-4 ${isFeatured ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-destructive transition-all active:scale-90"
          title="删除图片"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ImageGallery({ data, onSave }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { store } = useImageStore();

  const addImage = async (file: File) => {
    const imageId = await store(file, data.date);
    onSave((prev) => ({
      ...prev,
      images: [...(prev.images ?? []), imageId],
    }));
  };

  const removeImage = (imageId: string) => {
    onSave((prev) => ({
      ...prev,
      images: (prev.images ?? []).filter((id) => id !== imageId),
      featuredImageId: prev.featuredImageId === imageId ? undefined : prev.featuredImageId,
    }));
  };

  const setFeatured = (imageId: string) => {
    onSave((prev) => ({
      ...prev,
      featuredImageId: prev.featuredImageId === imageId ? undefined : imageId,
    }));
  };

  const images = data.images ?? [];

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border animate-fade-in">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide flex items-center gap-2">
        <span className="text-base">📷</span> 影像记录
      </h2>

      {images.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground/70">还没有照片 📸</p>
          <p className="text-xs text-muted-foreground/50 mt-1">点击下方按钮添加</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {images.map((imageId) => (
            <GalleryImage
              key={imageId}
              imageId={imageId}
              isFeatured={data.featuredImageId === imageId}
              onSetFeatured={() => setFeatured(imageId)}
              onRemove={() => removeImage(imageId)}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 active:scale-[0.98] transition-all"
      >
        <ImagePlus className="w-4 h-4" />
        添加照片
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) addImage(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
