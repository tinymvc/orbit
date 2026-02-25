import { formatFileSize } from "@/lib/utils";
import * as React from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FileUploadProps {
  /** Current value — single: File | string | null — multiple: (File|string)[] */
  value: unknown;
  /** Called when the value changes */
  onChange: (value: unknown) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Allow multiple file uploads */
  multiple?: boolean;
  /** Accepted file extensions without dots (e.g. ["jpg","png","webp"]) */
  acceptedTypes?: string[];
  /** Max file size in KB (per file) */
  maxFileSize?: number;
  /** Media URL prefix for displaying existing files (e.g. "/uploads/") */
  mediaUrl?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

type FileItem = File | string;

function isImageItem(item: FileItem): boolean {
  if (item instanceof File) return item.type.startsWith("image/");
  const ext = item.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext);
}

function buildPreviewUrl(item: FileItem, mediaUrl?: string): string | null {
  if (item instanceof File) return URL.createObjectURL(item);
  if (typeof item === "string" && item.length > 0) {
    if (item.startsWith("http://") || item.startsWith("https://")) return item;
    const base = (mediaUrl || "/uploads/").replace(/\/$/, "");
    return `${base}/${item.replace(/^\//, "")}`;
  }
  return null;
}

function itemName(item: FileItem): string {
  if (item instanceof File) return item.name;
  return item.split("/").pop() ?? item;
}

// ─── File Preview Card ──────────────────────────────────────────────────────

const FilePreview = React.memo(function FilePreview({
  item,
  mediaUrl,
  onRemove,
  onReplace,
  disabled,
  showReplace,
}: {
  item: FileItem;
  mediaUrl?: string;
  onRemove: () => void;
  onReplace?: () => void;
  disabled?: boolean;
  showReplace?: boolean;
}) {
  const isNew = item instanceof File;
  const isImg = isImageItem(item);
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const u = buildPreviewUrl(item, mediaUrl);
    setUrl(u);
    return () => {
      if (isNew && u) URL.revokeObjectURL(u);
    };
  }, [item, mediaUrl, isNew]);

  return (
    <div className="relative flex items-start gap-3 rounded-lg border p-3 bg-muted/30">
      {isImg && url ? (
        <img
          src={url}
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

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate pr-6">{itemName(item)}</p>
        {isNew && (
          <p className="text-xs text-muted-foreground">
            {formatFileSize((item as File).size)}
          </p>
        )}
        {!isNew && (
          <p className="text-xs text-muted-foreground">Current file</p>
        )}
        {showReplace && (
          <button
            type="button"
            className="text-xs text-primary hover:underline mt-1"
            onClick={onReplace}
            disabled={disabled}
          >
            Replace
          </button>
        )}
      </div>

      {!disabled && (
        <button
          type="button"
          className="absolute top-2 right-2 rounded-full p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          onClick={onRemove}
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
  );
});

// ─── Component ──────────────────────────────────────────────────────────────

export const FileUpload = React.memo<FileUploadProps>(
  ({
    value,
    onChange,
    disabled,
    multiple = false,
    acceptedTypes,
    maxFileSize,
    mediaUrl,
  }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = React.useState(false);
    const [sizeError, setSizeError] = React.useState<string | null>(null);

    const acceptAttr = acceptedTypes?.length
      ? acceptedTypes.map((t) => `.${t}`).join(",")
      : undefined;

    const maxSizeBytes = maxFileSize ? maxFileSize * 1024 : null;

    // ── Validate a single file ──────────────────────────────────────────

    const validateFile = React.useCallback(
      (file: File): string | null => {
        if (maxSizeBytes && file.size > maxSizeBytes) {
          return `File too large (${formatFileSize(file.size)}). Max: ${formatFileSize(maxSizeBytes)}`;
        }
        if (acceptedTypes?.length) {
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
          if (!acceptedTypes.includes(ext)) {
            return `Invalid file type (.${ext}). Accepted: ${acceptedTypes.join(", ")}`;
          }
        }
        return null;
      },
      [maxSizeBytes, acceptedTypes],
    );

    // ── Handle incoming files ───────────────────────────────────────────

    const handleFiles = React.useCallback(
      (files: FileList | null) => {
        if (!files?.length) return;

        if (!multiple) {
          const error = validateFile(files[0]!);
          if (error) {
            setSizeError(error);
            return;
          }
          setSizeError(null);
          onChange(files[0]!);
          return;
        }

        // Multiple mode — validate all, append to existing
        const validFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
          const error = validateFile(files[i]!);
          if (error) {
            setSizeError(error);
            return;
          }
          validFiles.push(files[i]!);
        }

        setSizeError(null);
        const current = Array.isArray(value) ? (value as FileItem[]) : [];
        onChange([...current, ...validFiles]);
      },
      [multiple, validateFile, onChange, value],
    );

    const handleDrop = React.useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      },
      [disabled, handleFiles],
    );

    // ── Removal ─────────────────────────────────────────────────────────

    const handleRemoveSingle = React.useCallback(() => {
      onChange(multiple ? [] : null);
      setSizeError(null);
      if (inputRef.current) inputRef.current.value = "";
    }, [onChange, multiple]);

    const handleRemoveAt = React.useCallback(
      (index: number) => {
        if (!Array.isArray(value)) return;
        const next = (value as FileItem[]).filter((_, i) => i !== index);
        onChange(next);
      },
      [value, onChange],
    );

    // ── Derive display items ────────────────────────────────────────────

    const items: FileItem[] = React.useMemo(() => {
      if (multiple) {
        return Array.isArray(value) ? (value as FileItem[]) : [];
      }
      if (value instanceof File) return [value as File];
      if (typeof value === "string" && value.length > 0) return [value];
      return [];
    }, [value, multiple]);

    const hasFiles = items.length > 0;

    // ── Drop zone ───────────────────────────────────────────────────────

    const dropZone = (
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
          <span className="font-medium text-primary">Click to upload</span> or
          drag and drop
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {[
            acceptedTypes?.length
              ? acceptedTypes.map((t) => t.toUpperCase()).join(", ")
              : null,
            maxFileSize ? `Max ${formatFileSize(maxFileSize * 1024)}` : null,
            multiple ? "Multiple files" : null,
          ]
            .filter(Boolean)
            .join(" · ") || "\u00A0"}
        </p>
      </div>
    );

    // ── Render ──────────────────────────────────────────────────────────

    return (
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />

        {(!hasFiles || multiple) && dropZone}

        {items.map((item, i) => (
          <FilePreview
            key={
              item instanceof File
                ? `new-${item.name}-${item.size}-${i}`
                : `existing-${item}`
            }
            item={item}
            mediaUrl={mediaUrl}
            disabled={disabled}
            onRemove={multiple ? () => handleRemoveAt(i) : handleRemoveSingle}
            onReplace={!multiple ? () => inputRef.current?.click() : undefined}
            showReplace={!multiple}
          />
        ))}

        {sizeError && <p className="text-xs text-destructive">{sizeError}</p>}
      </div>
    );
  },
);
