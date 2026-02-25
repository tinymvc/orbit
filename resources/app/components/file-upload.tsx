import { formatFileSize } from "@/lib/utils";
import * as React from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FileUploadProps {
  /** Current value: a File (new upload), a string path (existing), or null */
  value: unknown;
  /** Called when the value changes (File, null, or string) */
  onChange: (value: unknown) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Accepted file extensions without dots (e.g. ["jpg","png","webp"]) */
  acceptedTypes?: string[];
  /** Max file size in KB */
  maxFileSize?: number;
  /** Media URL prefix for displaying existing files (e.g. "/uploads/") */
  mediaUrl?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const FileUpload = React.memo<FileUploadProps>(
  ({ value, onChange, disabled, acceptedTypes, maxFileSize, mediaUrl }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = React.useState(false);
    const [sizeError, setSizeError] = React.useState<string | null>(null);

    const acceptAttr = acceptedTypes?.length
      ? acceptedTypes.map((t) => `.${t}`).join(",")
      : undefined;

    const maxSizeBytes = maxFileSize ? maxFileSize * 1024 : null;

    // Determine what we're showing
    const isNewFile = value instanceof File;
    const isExistingFile = typeof value === "string" && value.length > 0;
    const hasFile = isNewFile || isExistingFile;

    // Build preview URL
    const previewUrl = React.useMemo(() => {
      if (isNewFile) return URL.createObjectURL(value as File);
      if (isExistingFile) {
        const path = value as string;
        if (path.startsWith("http://") || path.startsWith("https://"))
          return path;
        const base = (mediaUrl || "/uploads/").replace(/\/$/, "");
        return `${base}/${path.replace(/^\//, "")}`;
      }
      return null;
    }, [value, isNewFile, isExistingFile, mediaUrl]);

    // Cleanup blob URL
    React.useEffect(() => {
      return () => {
        if (isNewFile && previewUrl) URL.revokeObjectURL(previewUrl);
      };
    }, [previewUrl, isNewFile]);

    const isImage = React.useMemo(() => {
      if (isNewFile) return (value as File).type.startsWith("image/");
      if (isExistingFile) {
        const ext = (value as string).split(".").pop()?.toLowerCase() ?? "";
        return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(
          ext,
        );
      }
      return false;
    }, [value, isNewFile, isExistingFile]);

    const handleFiles = React.useCallback(
      (files: FileList | null) => {
        if (!files?.length) return;
        const file = files[0]!;

        // Validate size
        if (maxSizeBytes && file.size > maxSizeBytes) {
          setSizeError(
            `File too large (${formatFileSize(file.size)}). Max: ${formatFileSize(maxSizeBytes)}`,
          );
          return;
        }

        // Validate extension
        if (acceptedTypes?.length) {
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
          if (!acceptedTypes.includes(ext)) {
            setSizeError(
              `Invalid file type (.${ext}). Accepted: ${acceptedTypes.join(", ")}`,
            );
            return;
          }
        }

        setSizeError(null);
        onChange(file);
      },
      [maxSizeBytes, acceptedTypes, onChange],
    );

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      },
      [disabled, handleFiles],
    );

    const handleRemove = React.useCallback(() => {
      onChange(null);
      setSizeError(null);
      if (inputRef.current) inputRef.current.value = "";
    }, [onChange]);

    return (
      <div className="space-y-2">
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />

        {/* Drop zone / upload area */}
        {!hasFile ? (
          <div
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <svg
              className="w-8 h-8 text-muted-foreground/60 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Click to upload</span>{" "}
              or drag and drop
            </p>
            {acceptedTypes?.length ? (
              <p className="text-xs text-muted-foreground/70 mt-1">
                {acceptedTypes.map((t) => t.toUpperCase()).join(", ")}
                {maxFileSize
                  ? ` · Max ${formatFileSize(maxFileSize * 1024)}`
                  : ""}
              </p>
            ) : maxFileSize ? (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Max {formatFileSize(maxFileSize * 1024)}
              </p>
            ) : null}
          </div>
        ) : (
          /* File preview / info */
          <div className="relative flex items-start gap-3 rounded-lg border p-3 bg-muted/30">
            {/* Image preview */}
            {isImage && previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-16 h-16 rounded-md object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate pr-3">
                {isNewFile
                  ? (value as File).name
                  : (value as string).split("/").pop()}
              </p>
              {isNewFile && (
                <p className="text-xs text-muted-foreground">
                  {formatFileSize((value as File).size)}
                </p>
              )}
              {isExistingFile && (
                <p className="text-xs text-muted-foreground">Current file</p>
              )}

              {/* Replace button */}
              <button
                type="button"
                className="text-xs text-primary hover:underline mt-1"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
              >
                Replace
              </button>
            </div>

            {/* Remove button */}
            {!disabled && (
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                onClick={handleRemove}
                title="Remove file"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Size error */}
        {sizeError && <p className="text-xs text-destructive">{sizeError}</p>}
      </div>
    );
  },
);
