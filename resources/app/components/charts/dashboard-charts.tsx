import { Suspense, useMemo } from "react";
import {
  LazyAreaChart,
  LazyBarChart,
  LazyPieChart,
  LazyRadarChart,
  LazyLineChart,
  Area,
  Bar,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  RadialBar,
  RadialBarChartBase,
  Line,
} from "@/components/charts/lazy-charts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChartData {
  type: "bar" | "line" | "area" | "pie" | "radar" | "radial";
  title: string;
  description: string;
  data: Record<string, unknown>[];
  dataKeys: string[];
  colors: string[];
  xAxisKey: string;
  colSpan: number;
  height: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildChartConfig(dataKeys: string[], colors: string[]) {
  const config: Record<string, { label: string; color: string }> = {};
  dataKeys.forEach((key, i) => {
    config[key] = {
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim(),
      color: colors[i] || `hsl(${(i * 137) % 360}, 70%, 50%)`,
    };
  });
  return config;
}

function buildPieConfig(data: Record<string, unknown>[], colors: string[]) {
  const cfg: Record<string, { label: string; color: string }> = {};
  data.forEach((item, i) => {
    const name = (item.name as string) || `slice-${i}`;
    cfg[name] = {
      label: name,
      color: colors[i] || `hsl(${(i * 137) % 360}, 70%, 50%)`,
    };
  });
  return cfg;
}

function getColor(colors: string[], index: number) {
  return colors[index] || `hsl(${(index * 137) % 360}, 70%, 50%)`;
}

// ─── Chart Renderers ────────────────────────────────────────────────────────

function BarChartRenderer({ chart }: { chart: ChartData }) {
  const config = useMemo(
    () => buildChartConfig(chart.dataKeys, chart.colors),
    [chart.dataKeys, chart.colors],
  );

  return (
    <ChartContainer
      config={config}
      className="w-full"
      style={{ height: chart.height }}
    >
      <LazyBarChart data={chart.data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={chart.xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          content={<ChartTooltipContent />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        {chart.dataKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </LazyBarChart>
    </ChartContainer>
  );
}

function LineChartRenderer({ chart }: { chart: ChartData }) {
  const config = useMemo(
    () => buildChartConfig(chart.dataKeys, chart.colors),
    [chart.dataKeys, chart.colors],
  );

  return (
    <ChartContainer
      config={config}
      className="w-full"
      style={{ height: chart.height }}
    >
      <LazyLineChart data={chart.data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={chart.xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {chart.dataKeys.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={{ r: 3, fill: `var(--color-${key})`, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        ))}
      </LazyLineChart>
    </ChartContainer>
  );
}

function AreaChartRenderer({ chart }: { chart: ChartData }) {
  const config = useMemo(
    () => buildChartConfig(chart.dataKeys, chart.colors),
    [chart.dataKeys, chart.colors],
  );

  const idPrefix = useMemo(
    () => chart.title.replace(/\s+/g, "-").toLowerCase(),
    [chart.title],
  );

  return (
    <ChartContainer
      config={config}
      className="w-full"
      style={{ height: chart.height }}
    >
      <LazyAreaChart data={chart.data}>
        <defs>
          {chart.dataKeys.map((key) => (
            <linearGradient
              key={key}
              id={`fill-${idPrefix}-${key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={`var(--color-${key})`}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${key})`}
                stopOpacity={0.05}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={chart.xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {chart.dataKeys.map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`var(--color-${key})`}
            fill={`url(#fill-${idPrefix}-${key})`}
            strokeWidth={2}
          />
        ))}
      </LazyAreaChart>
    </ChartContainer>
  );
}

function PieChartRenderer({ chart }: { chart: ChartData }) {
  const config = useMemo(
    () => buildPieConfig(chart.data, chart.colors),
    [chart.data, chart.colors],
  );

  const dataKey = chart.dataKeys[0] || "value";

  const outerRadius = Math.min(Math.floor(chart.height * 0.32), 120);
  const innerRadius = Math.floor(outerRadius * 0.55);

  return (
    <ChartContainer
      config={config}
      className="w-full"
      style={{ height: chart.height }}
    >
      <LazyPieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        <Pie
          data={chart.data}
          dataKey={dataKey}
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          paddingAngle={3}
          strokeWidth={2}
          stroke="hsl(var(--background))"
        >
          {chart.data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={getColor(chart.colors, i)} />
          ))}
        </Pie>
      </LazyPieChart>
    </ChartContainer>
  );
}

function RadarChartRenderer({ chart }: { chart: ChartData }) {
  const config = useMemo(
    () => buildChartConfig(chart.dataKeys, chart.colors),
    [chart.dataKeys, chart.colors],
  );

  return (
    <ChartContainer
      config={config}
      className="w-full"
      style={{ height: chart.height }}
    >
      <LazyRadarChart data={chart.data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid strokeDasharray="3 3" />
        <PolarAngleAxis dataKey={chart.xAxisKey} fontSize={12} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {chart.dataKeys.map((key) => (
          <Radar
            key={key}
            name={config[key]?.label || key}
            dataKey={key}
            stroke={`var(--color-${key})`}
            fill={`var(--color-${key})`}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </LazyRadarChart>
    </ChartContainer>
  );
}

function RadialChartRenderer({ chart }: { chart: ChartData }) {
  const config = useMemo(
    () => buildPieConfig(chart.data, chart.colors),
    [chart.data, chart.colors],
  );

  const dataKey = chart.dataKeys[0] || "value";

  const coloredData = useMemo(
    () =>
      chart.data.map((item, i) => ({
        ...item,
        fill: getColor(chart.colors, i),
      })),
    [chart.data, chart.colors],
  );

  return (
    <ChartContainer
      config={config}
      className="w-full"
      style={{ height: chart.height }}
    >
      <RadialBarChartBase
        data={coloredData}
        innerRadius="30%"
        outerRadius="90%"
        startAngle={180}
        endAngle={0}
        cx="50%"
        cy="70%"
      >
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <RadialBar
          dataKey={dataKey}
          background={{ fill: "hsl(var(--muted))" }}
          cornerRadius={6}
        />
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          verticalAlign="bottom"
        />
      </RadialBarChartBase>
    </ChartContainer>
  );
}

// ─── Registry & Layout ──────────────────────────────────────────────────────

const chartRenderers: Record<
  string,
  React.ComponentType<{ chart: ChartData }>
> = {
  bar: BarChartRenderer,
  line: LineChartRenderer,
  area: AreaChartRenderer,
  pie: PieChartRenderer,
  radar: RadarChartRenderer,
  radial: RadialChartRenderer,
};

const colSpanClasses: Record<number, string> = {
  1: "",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
};

function ChartFallback({ height }: { height: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-muted-foreground flex flex-col items-center gap-2">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        <span className="text-xs">Loading chart&hellip;</span>
      </div>
    </div>
  );
}

/**
 * Renders a single chart card with its title, description, and chart content.
 */
export function DashboardChart({ chart }: { chart: ChartData }) {
  const Renderer = chartRenderers[chart.type];

  if (!Renderer) {
    return null;
  }

  return (
    <Card className={colSpanClasses[chart.colSpan] || ""}>
      <CardHeader>
        <CardTitle className="text-base">{chart.title}</CardTitle>
        {chart.description && (
          <CardDescription>{chart.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        <Suspense fallback={<ChartFallback height={chart.height} />}>
          <Renderer chart={chart} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

/**
 * Renders a grid of dashboard chart cards.
 * Charts specify their own colSpan to control grid layout.
 */
export function ChartGrid({ charts }: { charts: ChartData[] }) {
  if (!charts?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:px-6">
      {charts.map((chart, index) => (
        <DashboardChart key={index} chart={chart} />
      ))}
    </div>
  );
}
