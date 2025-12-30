import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RiskItem } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface RiskUrgencyMapProps {
  risks: RiskItem[];
}

export default function RiskUrgencyMap({ risks }: RiskUrgencyMapProps) {
  const data = risks.map(risk => ({
    ...risk,
    // X-axis: Time to failure (Miles from now, or just Window Min)
    // Let's use Window Min as "Time to Failure" proxy
    mileageStart: risk.windowMin || 0,
    // Y-axis: Cost Exposure (Max Cost)
    cost: risk.costMax || 0,
    // Z-axis: Probability (size of bubble)
    prob: risk.probability
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
          <div className="font-bold mb-1 text-foreground flex items-center justify-between gap-4">
            {data.name}
            <Badge variant="outline" className={
              data.riskLevel === 'High' ? 'text-red-600 bg-red-50 border-red-200' :
              data.riskLevel === 'Moderate' ? 'text-orange-600 bg-orange-50 border-orange-200' :
              'text-emerald-600 bg-emerald-50 border-emerald-200'
            }>{data.riskLevel}</Badge>
          </div>
          <div className="space-y-1.5 text-muted-foreground pt-1">
            <div className="flex justify-between">
              <span>Expected:</span> 
              <span className="font-mono text-foreground font-medium">{data.mileageStart.toLocaleString()} mi</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Cost:</span> 
              <span className="font-mono text-foreground font-medium text-red-600">${data.cost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Probability:</span> 
              <span className="font-mono text-foreground font-medium">{(data.prob * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/60 shadow-sm w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GlossaryTooltip term="Risk Urgency" className="border-none gap-2 text-xl">Risk Urgency Map</GlossaryTooltip>
        </CardTitle>
        <CardDescription>
          Visualizing immediate vs. future liabilities.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="hsl(var(--foreground))" />
              <XAxis 
                type="number" 
                dataKey="mileageStart" 
                name="Mileage" 
                unit=" mi" 
                tickFormatter={(val) => `${val/1000}k`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={{ strokeOpacity: 0.2 }}
                label={{ value: "Mileage Window Start (Urgency)", position: "bottom", offset: 20, fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
              />
              <YAxis 
                type="number" 
                dataKey="cost" 
                name="Cost" 
                unit="$" 
                tickFormatter={(val) => `$${val}`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={{ strokeOpacity: 0.2 }}
                label={{ value: "Cost Exposure", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500, offset: 0 }}
              />
              <ZAxis type="number" dataKey="prob" range={[150, 800]} name="Probability" />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', strokeOpacity: 0.5 }} />
              
              {/* Quadrant Lines (approximate) */}
              <ReferenceLine x={70000} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.4}>
                <text x={70000} y={10} fill="hsl(var(--muted-foreground))" fontSize={10} textAnchor="middle">LATER</text>
                <text x={60000} y={10} fill="hsl(var(--muted-foreground))" fontSize={10} textAnchor="middle">SOONER</text>
              </ReferenceLine>
              <ReferenceLine y={500} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.4}>
                <text x={100000} y={500} fill="hsl(var(--muted-foreground))" fontSize={10} dy={-10} textAnchor="end">EXPENSIVE</text>
                <text x={100000} y={400} fill="hsl(var(--muted-foreground))" fontSize={10} dy={10} textAnchor="end">CHEAPER</text>
              </ReferenceLine>

              <Scatter name="Risks" data={data}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.riskLevel === 'High' ? 'hsl(var(--destructive))' : 
                      entry.riskLevel === 'Moderate' ? 'hsl(var(--chart-4))' : 
                      'hsl(var(--primary))'
                    } 
                    fillOpacity={0.8}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        {/* Helper Legend */}
        <div className="bg-muted/30 border border-border/50 rounded-lg p-3 mt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
           <div className="flex gap-4">
              <div className="flex items-center gap-2 font-medium">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" /> High Risk
              </div>
              <div className="flex items-center gap-2 font-medium">
                <div className="w-3 h-3 rounded-full bg-orange-400 shadow-sm" /> Moderate
              </div>
              <div className="flex items-center gap-2 font-medium">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" /> Low Risk
              </div>
           </div>
           <div className="text-muted-foreground italic flex items-center gap-1">
             <span className="w-2 h-2 rounded-full border border-current opacity-50" />
             Bubble size = Failure Probability
           </div>
        </div>

        {/* Interpretation Footer */}
        <div className="mt-6 pt-4 border-t border-border/50">
            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">How to read this</h4>
            <p className="text-sm text-muted-foreground leading-snug mb-3">
                Items on the <strong>Left</strong> are happening soon. Items at the <strong>Top</strong> are expensive. The worst place to be is Top-Left (Expensive & Soon).
            </p>
            <h4 className="text-xs font-bold uppercase text-amber-600 mb-2">What it means</h4>
            <p className="text-sm leading-snug">
                You have {risks.filter(r => r.windowMin && r.windowMin < 80000 && r.costMax && r.costMax > 500).length} high-priority items approaching. Budget accordingly or negotiate these costs off the price.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
