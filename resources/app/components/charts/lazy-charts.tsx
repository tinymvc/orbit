/**
 * Lazy-loaded Recharts components for code splitting
 * This file provides optimized chart components that are loaded on-demand
 *
 * NOTE: Only CONTAINER charts (AreaChart, BarChart, PieChart, ResponsiveContainer)
 * can be lazy-loaded. Child components (Area, Bar, XAxis, YAxis, etc.) MUST be
 * imported synchronously because parent charts inspect their children during render.
 */
import { lazy, type ComponentProps, type ComponentType } from "react";

// Import child components synchronously - they cannot be lazy loaded
// because recharts parent components need to inspect them during render
export {
  Area,
  Bar,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import type {
  AreaChart,
  BarChart,
  PieChart,
  ResponsiveContainer,
} from "recharts";

// Type helpers for container components
type AreaChartProps = ComponentProps<typeof AreaChart>;
type BarChartProps = ComponentProps<typeof BarChart>;
type PieChartProps = ComponentProps<typeof PieChart>;
type ResponsiveContainerProps = ComponentProps<typeof ResponsiveContainer>;

// Lazy load only container chart components
export const LazyAreaChart = lazy(() =>
  import("recharts").then((mod) => ({
    default: mod.AreaChart as unknown as ComponentType<AreaChartProps>,
  })),
);

export const LazyBarChart = lazy(() =>
  import("recharts").then((mod) => ({
    default: mod.BarChart as unknown as ComponentType<BarChartProps>,
  })),
);

export const LazyPieChart = lazy(() =>
  import("recharts").then((mod) => ({
    default: mod.PieChart as unknown as ComponentType<PieChartProps>,
  })),
);

export const LazyResponsiveContainer = lazy(() =>
  import("recharts").then((mod) => ({
    default:
      mod.ResponsiveContainer as unknown as ComponentType<ResponsiveContainerProps>,
  })),
);

// Re-export types for consumers
export type {
  AreaChartProps,
  BarChartProps,
  PieChartProps,
  ResponsiveContainerProps,
};
