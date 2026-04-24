import { ChangeEvent, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MAX_FILES = 6;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export interface ImageDraft {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImagePickerProps {
  images: ImageDraft[];
  onChange: (next: ImageDraft[]) => void;
  disabled?: boolean;
}

export const ImagePicker = ({ images, onChange, disabled }: ImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!picked.length) return;

    const remaining = MAX_FILES - images.length;
    if (remaining <= 0) {
      toast({
        title: "Photo limit reached",
        description: `You can upload up to ${MAX_FILES} photos.`,
        variant: "destructive",
      });
      return;
    }

    const valid: ImageDraft[] = [];
    for (const file of picked.slice(0, remaining)) {
      if (!ALLOWED.includes(file.type)) {
        toast({
          title: "Unsupported file",
          description: `${file.name} must be JPG, PNG, or WebP.`,
          variant: "destructive",
        });
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast({
          title: "Image too large",
          description: `${file.name} exceeds the 5MB limit.`,
          variant: "destructive",
        });
        continue;
      }
      valid.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (valid.length) onChange([...images, ...valid]);
  };

  const removeImage = (id: string) => {
    const target = images.find((i) => i.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(images.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
          >
            <img
              src={img.previewUrl}
              alt={`Preview ${i + 1}`}
              className="h-full w-full object-cover"
            />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-foreground">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeImage(img.id)}
              disabled={disabled}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background disabled:opacity-50"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {images.length < MAX_FILES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[11px] font-medium">Add photo</span>
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {images.length}/{MAX_FILES} photos · JPG, PNG, WebP · up to 5MB each
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {images.length === 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full gap-2"
        >
          <ImagePlus className="h-4 w-4" />
          Upload photos
        </Button>
      )}
    </div>
  );
};
