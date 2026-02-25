import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Check,
  X,
  Search,
  LoaderCircle,
  Plus,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  /** Available options */
  options?: ComboboxOption[];
  /** Currently selected value(s) — string for single, string[] for multiple */
  value: string | string[];
  /** Change handler */
  onChange: (value: string | string[]) => void;
  /** Allow selecting multiple values */
  multiple?: boolean;
  /** Allow user to create new tags that aren't in the options list */
  taggable?: boolean;
  /** Async search callback — called with the query string, should return options */
  onSearch?: (query: string) => Promise<ComboboxOption[]> | ComboboxOption[];
  /** Debounce delay in ms for async search (default: 300) */
  searchDebounce?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Max number of items that can be selected (multiple mode) */
  maxItems?: number;
  /** Custom class for the trigger */
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const Combobox = React.memo<ComboboxProps>(function Combobox({
  options: staticOptions = [],
  value,
  onChange,
  multiple = false,
  taggable = false,
  onSearch,
  searchDebounce = 300,
  placeholder = "Select...",
  disabled = false,
  maxItems,
  className,
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [asyncOptions, setAsyncOptions] = React.useState<ComboboxOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(null);

  // Normalise value to array for internal logic
  const selected: string[] = React.useMemo(
    () =>
      multiple
        ? Array.isArray(value)
          ? value
          : value
            ? [value as string]
            : []
        : value
          ? [value as string]
          : [],
    [value, multiple],
  );

  // Merged options: static + async (deduplicated)
  const allOptions = React.useMemo(() => {
    if (!onSearch) return staticOptions;
    const map = new Map<string, ComboboxOption>();
    for (const o of staticOptions) map.set(o.value, o);
    for (const o of asyncOptions) map.set(o.value, o);
    return Array.from(map.values());
  }, [staticOptions, asyncOptions, onSearch]);

  // Filtered options based on query (client-side filter when no onSearch)
  const filteredOptions = React.useMemo(() => {
    if (onSearch) return allOptions; // server already filtered
    if (!query.trim()) return allOptions;
    const q = query.toLowerCase();
    return allOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [allOptions, query, onSearch]);

  // Async search effect
  React.useEffect(() => {
    if (!onSearch || !open) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(
      async () => {
        setLoading(true);
        try {
          const results = await onSearch(query);
          setAsyncOptions(results);
        } catch {
          setAsyncOptions([]);
        } finally {
          setLoading(false);
        }
      },
      query ? searchDebounce : 0,
    );

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, onSearch, open, searchDebounce]);

  // fire a one-time empty search to seed labels from the server.
  const didSeedRef = React.useRef(false);
  React.useEffect(() => {
    if (didSeedRef.current || !onSearch || selected.length === 0) return;

    // Check if any selected value is missing a label
    const hasUnresolved = selected.some(
      (v) =>
        !staticOptions.some((o) => o.value === v) &&
        !asyncOptions.some((o) => o.value === v),
    );
    if (!hasUnresolved) return;

    didSeedRef.current = true;
    (async () => {
      try {
        const results = await onSearch("");
        setAsyncOptions((prev) => {
          const map = new Map<string, ComboboxOption>();
          for (const o of prev) map.set(o.value, o);
          for (const o of results) map.set(o.value, o);
          return Array.from(map.values());
        });
      } catch {
        // ignore — labels will show raw values as fallback
      }
    })();
  }, [onSearch, selected, staticOptions, asyncOptions]);

  // Focus input when popover opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
    }
  }, [open]);

  // ── Selection helpers ─────────────────────────────────────────────

  const isSelected = React.useCallback(
    (val: string) => selected.includes(val),
    [selected],
  );

  const toggleItem = React.useCallback(
    (val: string) => {
      if (!multiple) {
        onChange(val === selected[0] ? "" : val);
        setOpen(false);
        return;
      }
      if (selected.includes(val)) {
        onChange(selected.filter((v) => v !== val));
      } else {
        if (maxItems && selected.length >= maxItems) return;
        onChange([...selected, val]);
      }
    },
    [multiple, selected, onChange, maxItems],
  );

  const removeItem = React.useCallback(
    (val: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      if (!multiple) {
        onChange("");
        return;
      }
      onChange(selected.filter((v) => v !== val));
    },
    [multiple, selected, onChange],
  );

  const handleCreateTag = React.useCallback(() => {
    const tag = query.trim();
    if (!tag) return;
    if (!selected.includes(tag)) {
      if (multiple) {
        if (maxItems && selected.length >= maxItems) return;
        onChange([...selected, tag]);
      } else {
        onChange(tag);
        setOpen(false);
      }
    }
    setQuery("");
  }, [query, selected, multiple, onChange, maxItems]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        // If taggable and query doesn't exactly match an option, create tag
        if (
          taggable &&
          query.trim() &&
          !filteredOptions.some(
            (o) => o.label.toLowerCase() === query.trim().toLowerCase(),
          )
        ) {
          handleCreateTag();
          return;
        }
        // Select first visible option
        if (filteredOptions.length > 0) {
          toggleItem(filteredOptions[0]!.value);
        }
      }
      if (e.key === "Backspace" && !query && multiple && selected.length > 0) {
        onChange(selected.slice(0, -1));
      }
    },
    [
      taggable,
      query,
      filteredOptions,
      handleCreateTag,
      toggleItem,
      multiple,
      selected,
      onChange,
    ],
  );

  // ── Resolve display label ────────────────────────────────────────

  const getLabel = React.useCallback(
    (val: string) => {
      const opt = allOptions.find((o) => o.value === val);
      return opt?.label ?? val;
    },
    [allOptions],
  );

  // Can we show "Create" tag action?
  const showCreateTag =
    taggable &&
    query.trim() &&
    !filteredOptions.some(
      (o) => o.label.toLowerCase() === query.trim().toLowerCase(),
    ) &&
    !selected.includes(query.trim());

  const newLocal = "truncate max-w-[120px]";
  // ── Render ────────────────────────────────────────────────────────

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal h-auto min-h-9",
            !selected.length && "text-muted-foreground",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1 items-center flex-1 text-left">
            {multiple && selected.length > 0 ? (
              selected.map((val) => (
                <Badge
                  key={val}
                  variant="secondary"
                  className="text-xs px-1.5 py-0 h-5 gap-1 shrink-0"
                >
                  <span className={newLocal}>{getLabel(val)}</span>
                  {!disabled && (
                    <span
                      role="button"
                      tabIndex={-1}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 cursor-pointer inline-flex"
                      onClick={(e) => removeItem(val, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          removeItem(val);
                        }
                      }}
                    >
                      <X className="w-2.5 h-2.5" />
                    </span>
                  )}
                </Badge>
              ))
            ) : !multiple && selected.length === 1 ? (
              <span className="truncate text-foreground">
                {getLabel(selected[0]!)}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          {loading ? (
            <LoaderCircle className="w-4 h-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="w-4 h-4 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={taggable ? "Search or type to create..." : "Search..."}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Options list */}
        <div className="max-h-56 overflow-y-auto p-1">
          {filteredOptions.length === 0 && !loading && !showCreateTag && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          )}

          {filteredOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer transition-colors",
                isSelected(opt.value)
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50",
              )}
              onClick={() => toggleItem(opt.value)}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-4 h-4 shrink-0",
                  !isSelected(opt.value) && "invisible",
                )}
              >
                <Check className="w-4 h-4 shrink-0 text-primary" />
              </div>
              <span className="truncate">{opt.label}</span>
            </button>
          ))}

          {/* Create new tag */}
          {showCreateTag && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent/50 text-primary"
              onClick={handleCreateTag}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>
                Create &quot;<strong>{query.trim()}</strong>&quot;
              </span>
            </button>
          )}

          {loading && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          )}
        </div>

        {/* Footer info for multiple mode */}
        {multiple && selected.length > 0 && (
          <div className="border-t px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selected.length} selected
              {maxItems ? ` / ${maxItems} max` : ""}
            </span>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                onChange(multiple ? [] : "");
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});
