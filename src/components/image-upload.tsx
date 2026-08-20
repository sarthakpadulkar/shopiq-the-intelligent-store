import { ImagePlus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      onChange(file);
    },
    [onChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-border/60">
          <img src={preview} alt="Preview" className="h-48 w-full object-cover" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 size-7"
            disabled={disabled}
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          className={`flex h-48 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors ${
            dragging
              ? "border-primary bg-primary/10"
              : "border-border/60 hover:border-primary/40 hover:bg-muted/20"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Drop image or click to browse
          </span>
          <span className="text-xs text-muted-foreground/60">JPEG, PNG or WebP — max 5 MB</span>
        </button>
      )}
    </div>
  );
}
