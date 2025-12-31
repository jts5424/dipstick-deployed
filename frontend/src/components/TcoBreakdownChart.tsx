import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface TcoBreakdownChartProps {
  costs?: { name: string; value: number }[];
  totalCost?: number;
  // Legacy prop support
  data?: {
    depreciationLoss: number;
    routineMaintenance: number;
    gapMaintenance: number;
    expectedRepairs: number;
  };
}

export default function TcoBreakdownChart({ costs, totalCost, data }: TcoBreakdownChartProps) {
  let chartData: { name: string; value: number; color: string }[] = [];

  if (costs) {
     chartData = costs.map((c, i) => ({
       name: c.name,
       value: c.value,
       color: i === 0 ? "hsl(var(--chart-1))" : 
              i === 1 ? "hsl(var(--chart-2))" : 
              i === 2 ? "hsl(var(--chart-4))" : 
              "hsl(var(--destructive))"
     }));
  } else if (data) {
     chartData = [
      { name: "Depreciation", value: data.depreciationLoss, color: "hsl(var(--chart-1))" },
      { name: "Maintenance", value: data.routineMaintenance, color: "hsl(var(--chart-2))" },
      { name: "Service Gaps", value: data.gapMaintenance, color: "hsl(var(--chart-4))" },
      { name: "Risk/Repairs", value: data.expectedRepairs, color: "hsl(var(--destructive))" },
    ];
  }

  return (
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
           <GlossaryTooltip term="3-Year TCO" className="border-none gap-2 text-xl">3-Year Cost Breakdown</GlossaryTooltip>
        </CardTitle>
        <CardDescription>Where your money goes beyond the purchase price</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                type="number" 
                tickFormatter={(val) => `$${(val/1000).toFixed(1)}k`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip 
                cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '12px'
                }}
                formatter={(value: number) => [<span className="font-mono font-bold text-foreground">${value.toLocaleString()}</span>, 'Cost']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40} background={{ fill: 'hsl(var(--muted))' }}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50 grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
              How to read this
            </h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A high red "Risk/Repairs" bar means you're buying a liability. Negotiate the price down to offset these future costs.
            </p>
          </div>
          <div className="space-y-1.5 bg-muted/30 p-2 rounded border border-border/50">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              The Bottom Line
            </h5>
            <p className="text-xs font-medium text-foreground leading-relaxed">
              You are committing to <span className="font-mono font-bold">${((totalCost || 0) + 25000).toLocaleString()}</span> total over 3 years, not just the purchase price.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
