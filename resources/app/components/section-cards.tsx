import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface StatCard {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  footer: string;
  description: string;
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

function StatCardItem({ stat }: { stat: StatCard }) {
  const TrendIcon = trendIcons[stat.trend] ?? Minus;
  const changePrefix = stat.change > 0 ? "+" : "";

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{stat.label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {stat.value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <TrendIcon />
            {changePrefix}
            {stat.change}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {stat.footer} <TrendIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">{stat.description}</div>
      </CardFooter>
    </Card>
  );
}

export function SectionCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCardItem key={index} stat={stat} />
      ))}
    </div>
  );
}
