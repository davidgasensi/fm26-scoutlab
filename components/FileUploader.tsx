"use client";

import { useCallback, useRef, useState } from "react";

interface FileUploaderProps {
  onFileLoaded: (content: string, filename: string) => void;
  version?: "FM26" | "FM24";
  fileName?: string | null;
}

const VERSION_COLOR: Record<string, string> = {
  FM26: "#00ff87",
  FM24: "#38bdf8",
};

export default function FileUploader({ onFileLoaded, version, fileName }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const accent = version ? VERSION_COLOR[version] : VERSION_COLOR.FM26;
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedFileName = fileName !== undefined ? fileName : localFileName;

  const handleFile = useCallback(
    (file: File) => {
      setLocalFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileLoaded(text, file.name);
      };
      reader.readAsText(file, "utf-8");
    },
    [onFileLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.name.endsWith(".html"))) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className="focus-accent interactive-press relative z-10 border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 group"
      style={{
        borderColor: isDragging
          ? accent
          : version
            ? `color-mix(in srgb, ${accent} 33%, transparent)`
            : "var(--color-border-subtle)",
        background: isDragging
          ? `color-mix(in srgb, ${accent} 8%, var(--color-bg-card))`
          : "var(--color-bg-card)",
        transform: isDragging ? "scale(1.01)" : undefined,
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.html"
        className="hidden"
        onChange={handleChange}
      />

      {/* Version badge */}
      {version && (
        <div
          className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-widest"
          style={{ fontFamily: "var(--font-mono)", background: accent, color: "#0a0e17" }}
        >
          {version}
        </div>
      )}

      {/* Upload icon */}
      <div
        className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center transition-colors"
        style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)` }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70 group-hover:opacity-100 transition-opacity"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <div className="relative min-h-[52px]">
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-200 ${
            selectedFileName ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          <p
            className="font-semibold text-sm"
            style={{ fontFamily: "var(--font-mono)", color: accent }}
          >
            {selectedFileName}
          </p>
          <p className="text-[var(--color-text-muted)] text-xs mt-1">
            Arrastra otro fichero para reemplazar
          </p>
        </div>

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-200 ${
            selectedFileName ? "opacity-0 translate-y-1 pointer-events-none" : "opacity-100 translate-y-0"
          }`}
        >
          <p className="text-[var(--color-text-secondary)] font-medium text-sm">
            Arrastra tu exportación aquí o{" "}
            <span className="underline underline-offset-2" style={{ color: accent }}>
              haz clic para seleccionar
            </span>
          </p>
          <p
            className="text-[var(--color-text-muted)] text-xs mt-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            FM26: CSV (separador ;) · FM24: HTML
          </p>
        </div>
      </div>
    </div>
  );
}
