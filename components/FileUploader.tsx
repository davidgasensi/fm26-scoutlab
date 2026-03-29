"use client";

import { useCallback, useState, useRef } from "react";

interface FileUploaderProps {
  onFileLoaded: (csvText: string) => void;
}

export default function FileUploader({ onFileLoaded }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onFileLoaded(text);
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
      if (file && file.name.endsWith(".csv")) {
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
      className={`
        relative z-10 border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
        transition-all duration-300 group
        ${
          isDragging
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.01]"
            : "border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg-card-hover)]"
        }
      `}
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
        accept=".csv"
        className="hidden"
        onChange={handleChange}
      />

      {/* Upload icon */}
      <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center group-hover:bg-[var(--color-accent)]/15 transition-colors">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
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

      {fileName ? (
        <div>
          <p
            className="text-[var(--color-accent)] font-semibold text-sm"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {fileName}
          </p>
          <p className="text-[var(--color-text-muted)] text-xs mt-1">
            Arrastra otro CSV para reemplazar
          </p>
        </div>
      ) : (
        <div>
          <p className="text-[var(--color-text-secondary)] font-medium text-sm">
            Arrastra tu CSV aquí o{" "}
            <span className="text-[var(--color-accent)] underline underline-offset-2">
              haz clic para seleccionar
            </span>
          </p>
          <p
            className="text-[var(--color-text-muted)] text-xs mt-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Formato: exportación FM26 (separador ;)
          </p>
        </div>
      )}
    </div>
  );
}
