"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";

interface ImageUploaderProps {
  onFile: (file: File) => void;
}

export function ImageUploader({ onFile }: ImageUploaderProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        className="focus-ring inline-flex items-center gap-2 bg-tadeo-blue px-4 py-2 text-sm font-bold text-white"
        onClick={() => ref.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Subir imagen
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </>
  );
}
