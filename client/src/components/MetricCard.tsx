import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  valueClassName?: string;
}

export default function MetricCard({ title, value, subtext, icon, trend, trendValue, className, valueClassName }: MetricCardProps) {
  return (
    <Card className={cn("border-border/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900", className)}>
      <div className="absolute top-0 right-0 p-16 bg-gradient-to-br from-primary/5 to-transparent blur-3xl rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide font-sans flex items-center gap-1">
          <GlossaryTooltip term={title} className="border-none gap-1.5 hover:text-foreground transition-colors">
            {title}
          </GlossaryTooltip>
        </CardTitle>
        {icon && <div className="text-muted-foreground/40 group-hover:text-primary transition-colors duration-300">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn("text-4xl md:text-5xl font-bold tracking-tight font-sans text-foreground", valueClassName)}>{value}</div>
        {(subtext || trendValue) && (
          <div className="flex items-center mt-3 gap-2">
            {trend && trendValue && (
              <Badge variant="outline" className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-bold border-0",
                trend === 'up' ? "text-emerald-700 bg-emerald-50/80" : 
                trend === 'down' ? "text-red-700 bg-red-50/80" : 
                "text-foreground bg-muted/80"
              )}>
                {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '−'} {trendValue}
              </Badge>
            )}
            <p className="text-xs text-muted-foreground font-medium opacity-80">{subtext}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
