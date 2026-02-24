import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Youtube from "@tiptap/extension-youtube";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Minus,
  Undo,
  Redo,
  Code,
  MoreHorizontal,
  RemoveFormatting,
  ChevronDown,
  Pilcrow,
  Heading2,
  Heading3,
  Quote,
  SquareCode,
  Type,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  ListChecks,
  ImagePlus,
  Youtube as YoutubeLucide,
  Table2,
  Plus,
  Trash2,
} from "lucide-react";

// ─── Toolbar Button ─────────────────────────────────────────────────────────

const Btn = React.memo(function Btn({
  active,
  onClick,
  children,
  title,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <Toggle
      size="sm"
      pressed={active}
      onPressedChange={onClick}
      aria-label={title}
      title={title}
      disabled={disabled}
      className="h-7 w-7 p-0"
    >
      {children}
    </Toggle>
  );
});

// ─── Popover menu item ──────────────────────────────────────────────────────

function MenuItem({
  icon,
  label,
  active,
  onClick,
  shortcut,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  shortcut?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-accent",
        active && "bg-accent text-accent-foreground",
      )}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <kbd className="ml-auto text-[10px] tracking-wide text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

// ─── Block Type Popover ─────────────────────────────────────────────────────

const BLOCK_TYPES = [
  { label: "Paragraph", icon: Pilcrow, type: "paragraph" },
  { label: "Heading 2", icon: Heading2, type: "heading", level: 2 },
  { label: "Heading 3", icon: Heading3, type: "heading", level: 3 },
  { label: "Blockquote", icon: Quote, type: "blockquote" },
  { label: "Code Block", icon: SquareCode, type: "codeBlock" },
] as const;

const BlockTypePopover = React.memo(function BlockTypePopover({
  editor,
}: {
  editor: Editor;
}) {
  const [open, setOpen] = React.useState(false);

  const currentLabel = React.useMemo(() => {
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("blockquote")) return "Quote";
    if (editor.isActive("codeBlock")) return "Code";
    return "Paragraph";
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    editor.isActive("heading", { level: 2 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    editor.isActive("heading", { level: 3 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    editor.isActive("blockquote"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    editor.isActive("codeBlock"),
  ]);

  const handleSelect = React.useCallback(
    (type: string, level?: number) => {
      const chain = editor.chain().focus();
      switch (type) {
        case "paragraph":
          chain.setParagraph().run();
          break;
        case "heading":
          chain.toggleHeading({ level: level as 2 | 3 }).run();
          break;
        case "blockquote":
          chain.toggleBlockquote().run();
          break;
        case "codeBlock":
          chain.toggleCodeBlock().run();
          break;
      }
      setOpen(false);
    },
    [editor],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex h-7 items-center gap-0.5 rounded-md px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          title="Block type"
        >
          <span className="max-w-20 truncate">{currentLabel}</span>
          <ChevronDown className="size-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start" side="bottom">
        {BLOCK_TYPES.map((block) => {
          const Icon = block.icon;
          const isActive =
            block.type === "heading"
              ? editor.isActive("heading", { level: block.level })
              : block.type === "paragraph"
                ? !editor.isActive("heading") &&
                  !editor.isActive("blockquote") &&
                  !editor.isActive("codeBlock")
                : editor.isActive(block.type);
          return (
            <MenuItem
              key={block.label}
              icon={<Icon className="size-3.5" />}
              label={block.label}
              active={isActive}
              onClick={() =>
                handleSelect(
                  block.type,
                  "level" in block ? block.level : undefined,
                )
              }
            />
          );
        })}
      </PopoverContent>
    </Popover>
  );
});

// ─── Text Formatting Popover ────────────────────────────────────────────────

const TextFormatPopover = React.memo(function TextFormatPopover({
  editor,
}: {
  editor: Editor;
}) {
  const [open, setOpen] = React.useState(false);

  const hasAnyMark =
    editor.isActive("bold") ||
    editor.isActive("italic") ||
    editor.isActive("underline") ||
    editor.isActive("strike") ||
    editor.isActive("subscript") ||
    editor.isActive("superscript") ||
    editor.isActive("highlight") ||
    editor.isActive("code");

  const isMac =
    typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
  const mod = isMac ? "⌘" : "Ctrl+";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex h-7 items-center gap-0.5 rounded-md px-1.5 text-foreground transition-colors hover:bg-muted",
            hasAnyMark && "bg-accent text-accent-foreground",
          )}
          title="Text formatting"
        >
          <Type className="size-3.5" />
          <ChevronDown className="size-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1" align="start" side="bottom">
        <MenuItem
          icon={<Bold className="size-3.5" />}
          label="Bold"
          shortcut={`${mod}B`}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <MenuItem
          icon={<Italic className="size-3.5" />}
          label="Italic"
          shortcut={`${mod}I`}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <MenuItem
          icon={<UnderlineIcon className="size-3.5" />}
          label="Underline"
          shortcut={`${mod}U`}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <MenuItem
          icon={<Strikethrough className="size-3.5" />}
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <MenuItem
          icon={<SubscriptIcon className="size-3.5" />}
          label="Subscript"
          active={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        />
        <MenuItem
          icon={<SuperscriptIcon className="size-3.5" />}
          label="Superscript"
          active={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        />
        <MenuItem
          icon={<Highlighter className="size-3.5" />}
          label="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />
        <MenuItem
          icon={<Code className="size-3.5" />}
          label="Inline code"
          shortcut={`${mod}E`}
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
        <div className="my-1 h-px bg-border" />
        <MenuItem
          icon={<RemoveFormatting className="size-3.5" />}
          label="Clear formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        />
      </PopoverContent>
    </Popover>
  );
});

// ─── Link Popover ───────────────────────────────────────────────────────────

const LinkPopover = React.memo(function LinkPopover({
  editor,
}: {
  editor: Editor;
}) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");

  const isActive = editor.isActive("link");

  const handleOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) setUrl(editor.getAttributes("link").href ?? "");
      setOpen(nextOpen);
    },
    [editor],
  );

  const applyLink = React.useCallback(() => {
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    setOpen(false);
  }, [editor, url]);

  const removeLink = React.useCallback(() => {
    editor.chain().focus().unsetLink().run();
    setOpen(false);
  }, [editor]);

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Toggle
          size="sm"
          pressed={isActive}
          onPressedChange={() => handleOpen(!open)}
          aria-label="Link"
          title="Link"
          className="h-7 w-7 p-0"
        >
          <LinkIcon className="size-3.5" />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-3"
        align="start"
        side="bottom"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const target = e.currentTarget as HTMLElement | null;
          setTimeout(() => target?.querySelector("input")?.focus(), 0);
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="rte-link-url" className="text-xs font-medium">
            URL
          </Label>
          <Input
            id="rte-link-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
          />
          <div className="flex items-center justify-between pt-1">
            {isActive ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={removeLink}
              >
                <Unlink className="mr-1 size-3" />
                Remove
              </Button>
            ) : (
              <span />
            )}
            <Button size="sm" className="h-7 text-xs" onClick={applyLink}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

// ─── Insert Popover ─────────────────────────────────────────────────────────

const InsertPopover = React.memo(function InsertPopover({
  editor,
}: {
  editor: Editor;
}) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<"menu" | "image" | "youtube">("menu");
  const [url, setUrl] = React.useState("");

  const reset = React.useCallback(() => {
    setView("menu");
    setUrl("");
    setOpen(false);
  }, []);

  const insertImage = React.useCallback(() => {
    if (url) editor.chain().focus().setImage({ src: url }).run();
    reset();
  }, [editor, url, reset]);

  const insertYoutube = React.useCallback(() => {
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
    reset();
  }, [editor, url, reset]);

  const insertTable = React.useCallback(() => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
    reset();
  }, [editor, reset]);

  return (
    <Popover open={open} onOpenChange={(v) => (v ? setOpen(true) : reset())}>
      <PopoverTrigger asChild>
        <Toggle
          size="sm"
          pressed={false}
          aria-label="Insert"
          title="Insert"
          className="h-7 w-7 p-0"
        >
          <Plus className="size-3.5" />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent
        className={cn(view === "menu" ? "w-44 p-1" : "w-72 p-3")}
        align="end"
        side="bottom"
      >
        {view === "menu" ? (
          <>
            <MenuItem
              icon={<ImagePlus className="size-3.5" />}
              label="Image"
              onClick={() => setView("image")}
            />
            <MenuItem
              icon={<YoutubeLucide className="size-3.5" />}
              label="YouTube video"
              onClick={() => setView("youtube")}
            />
            <MenuItem
              icon={<Table2 className="size-3.5" />}
              label="Table (3×3)"
              onClick={insertTable}
            />
            <div className="my-1 h-px bg-border" />
            <MenuItem
              icon={<Minus className="size-3.5" />}
              label="Horizontal rule"
              onClick={() => {
                editor.chain().focus().setHorizontalRule().run();
                reset();
              }}
            />
          </>
        ) : (
          <div className="grid gap-2">
            <Label className="text-xs font-medium">
              {view === "image" ? "Image URL" : "YouTube URL"}
            </Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                view === "image"
                  ? "https://example.com/photo.jpg"
                  : "https://youtube.com/watch?v=..."
              }
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  view === "image" ? insertImage() : insertYoutube();
                }
              }}
            />
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setView("menu");
                  setUrl("");
                }}
              >
                ← Back
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={view === "image" ? insertImage : insertYoutube}
              >
                Insert
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});

// ─── More Actions Popover ───────────────────────────────────────────────────

const MorePopover = React.memo(function MorePopover({
  editor,
}: {
  editor: Editor;
}) {
  const inTable = editor.isActive("table");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Toggle
          size="sm"
          pressed={false}
          aria-label="More options"
          title="More options"
          className="h-7 w-7 p-0"
        >
          <MoreHorizontal className="size-3.5" />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end" side="bottom">
        <MenuItem
          icon={<AlignLeft className="size-3.5" />}
          label="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <MenuItem
          icon={<AlignCenter className="size-3.5" />}
          label="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <MenuItem
          icon={<AlignRight className="size-3.5" />}
          label="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />
        {inTable && (
          <>
            <div className="my-1 h-px bg-border" />
            <MenuItem
              icon={<Plus className="size-3.5" />}
              label="Add row before"
              onClick={() => editor.chain().focus().addRowBefore().run()}
            />
            <MenuItem
              icon={<Plus className="size-3.5" />}
              label="Add row after"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            />
            <MenuItem
              icon={<Plus className="size-3.5" />}
              label="Add column before"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            />
            <MenuItem
              icon={<Plus className="size-3.5" />}
              label="Add column after"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            />
            <div className="my-1 h-px bg-border" />
            <MenuItem
              icon={<Trash2 className="size-3.5" />}
              label="Delete row"
              onClick={() => editor.chain().focus().deleteRow().run()}
            />
            <MenuItem
              icon={<Trash2 className="size-3.5" />}
              label="Delete column"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            />
            <MenuItem
              icon={<Trash2 className="size-3.5" />}
              label="Delete table"
              onClick={() => editor.chain().focus().deleteTable().run()}
            />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
});

// ─── Compact Toolbar ────────────────────────────────────────────────────────

const EditorToolbar = React.memo(function EditorToolbar({
  editor,
}: {
  editor: Editor;
}) {
  return (
    <div className="flex items-center gap-0.5 border-b px-1 py-1">
      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
        disabled={!editor.can().undo()}
      >
        <Undo className="size-3.5" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
        disabled={!editor.can().redo()}
      >
        <Redo className="size-3.5" />
      </Btn>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <BlockTypePopover editor={editor} />
      <TextFormatPopover editor={editor} />

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Btn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <List className="size-3.5" />
      </Btn>
      <Btn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered list"
      >
        <ListOrdered className="size-3.5" />
      </Btn>
      <Btn
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        title="Task list"
      >
        <ListChecks className="size-3.5" />
      </Btn>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <LinkPopover editor={editor} />
      <InsertPopover editor={editor} />
      <MorePopover editor={editor} />
    </div>
  );
});

// ─── Minimal custom styles (prose handles the rest) ─────────────────────────

const EDITOR_STYLES = `
.tiptap-editor .ProseMirror {
  outline: none;
  min-height: inherit;
}
.tiptap-editor .ProseMirror > *:first-child {
  margin-top: 0;
}
.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
  color: hsl(var(--muted-foreground));
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.tiptap-editor .ProseMirror table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}
.tiptap-editor .ProseMirror th,
.tiptap-editor .ProseMirror td {
  border: 1px solid hsl(var(--border));
  padding: 0.4em 0.6em;
  min-width: 80px;
  vertical-align: top;
}
.tiptap-editor .ProseMirror th {
  background: hsl(var(--muted));
  font-weight: 600;
}
.tiptap-editor .ProseMirror ul[data-type="taskList"] {
  list-style: none;
  padding-left: 0;
}
.tiptap-editor .ProseMirror ul[data-type="taskList"] li {
  display: flex;
  align-items: flex-start;
  gap: 0.4em;
}
.tiptap-editor .ProseMirror ul[data-type="taskList"] li > label {
  margin-top: 0.25em;
}
.tiptap-editor .ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
}
.tiptap-editor .ProseMirror div[data-youtube-video] iframe {
  max-width: 100%;
  border-radius: 0.375rem;
}
.tiptap-editor .ProseMirror .selectedCell {
  background: hsl(var(--accent));
}
`;

// Inject styles once globally
let stylesInjected = false;
function useInjectStyles() {
  React.useEffect(() => {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement("style");
    style.textContent = EDITOR_STYLES;
    document.head.appendChild(style);
  }, []);
}

// Stable extension array — created once per mount
function useExtensions(placeholder: string) {
  return React.useMemo(
    () => [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Underline,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: true }),
      Subscript,
      Superscript,
      Typography,
      CharacterCount,
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      Youtube.configure({ inline: false }),
      Color,
      TextStyle,
    ],
    [placeholder],
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Minimum editor height — converted to a CSS min-height. Default: "10rem" */
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  minHeight = "10rem",
}: RichTextEditorProps) {
  useInjectStyles();

  const extensions = useExtensions(placeholder ?? "Start writing…");

  const [charCount, setCharCount] = React.useState({ chars: 0, words: 0 });

  const editor = useEditor({
    extensions,
    content: value ?? "",
    editable: !disabled,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    onCreate: ({ editor: e }) => {
      setCharCount({
        chars: e.storage.characterCount.characters(),
        words: e.storage.characterCount.words(),
      });
    },
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
      setCharCount({
        chars: e.storage.characterCount.characters(),
        words: e.storage.characterCount.words(),
      });
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none px-3 py-2 focus:outline-none",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync external value changes (e.g. reset form)
  React.useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  // Sync disabled state
  React.useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "tiptap-editor overflow-hidden rounded-md border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-end border-t px-3 py-1">
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {charCount.chars} chars · {charCount.words} words
        </span>
      </div>
    </div>
  );
}
