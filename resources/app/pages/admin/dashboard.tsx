import { SectionCards, type StatCard } from "@/components/section-cards";
import {
  ChartGrid,
  type ChartData,
} from "@/components/charts/dashboard-charts";
import {
  DashboardHeader,
  type DateRangeConfig,
} from "@/components/dashboard-header";

interface DashboardProps {
  auth: { user: User };
  dashboard: {
    title: string;
    description: string;
    stats: StatCard[];
    charts: ChartData[];
    dateRange?: DateRangeConfig;
  };
}

export default function ({ dashboard }: DashboardProps) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashboardHeader
        title={dashboard.title}
        description={dashboard.description}
        dateRange={dashboard.dateRange}
      />
      {dashboard.stats?.length > 0 && <SectionCards stats={dashboard.stats} />}
      <ChartGrid charts={dashboard.charts} />
    </div>
  );
}
