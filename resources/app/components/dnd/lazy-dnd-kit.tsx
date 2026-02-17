/**
 * Lazy-loaded dnd-kit wrapper components for code splitting
 *
 * dnd-kit is a modular library (~150kb total). For pages that use drag-and-drop,
 * we provide lazy-loaded wrappers for the context providers while keeping hooks
 * imported synchronously (React hooks cannot be lazy loaded).
 *
 * This file is designed to be tree-shaken by Vite:
 * - Import only what you need from this file
 * - Hooks are bundled with consuming components
 * - DndContextLazy/DragOverlayLazy trigger dynamic imports for DndContext/DragOverlay
 */
import * as React from "react";
import { Loader2 } from "lucide-react";

// ============================================================================
// Synchronous hook exports - these MUST be imported synchronously for React
// ============================================================================
export {
  useSensor,
  useSensors,
  useDroppable,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  MeasuringStrategy,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";

export {
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";

export { CSS } from "@dnd-kit/utilities";

export {
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
} from "@dnd-kit/modifiers";

// ============================================================================
// Lazy-loaded component wrappers - these trigger dynamic imports
// ============================================================================

// Lazy load DndContext and DragOverlay
const LazyDndContext = React.lazy(() =>
  import("@dnd-kit/core").then((mod) => ({ default: mod.DndContext })),
);

const LazyDragOverlay = React.lazy(() =>
  import("@dnd-kit/core").then((mod) => ({ default: mod.DragOverlay })),
);

// Loading fallback for DnD context
const DndLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

// Typed wrapper for DndContext with Suspense
type DndContextProps = React.ComponentProps<typeof LazyDndContext>;

export const DndContextLazy: React.FC<DndContextProps> = (props) => (
  <React.Suspense fallback={<DndLoadingFallback />}>
    <LazyDndContext {...props} />
  </React.Suspense>
);

// Typed wrapper for DragOverlay with Suspense
type DragOverlayProps = React.ComponentProps<typeof LazyDragOverlay>;

export const DragOverlayLazy: React.FC<DragOverlayProps> = (props) => (
  <React.Suspense fallback={null}>
    <LazyDragOverlay {...props} />
  </React.Suspense>
);
