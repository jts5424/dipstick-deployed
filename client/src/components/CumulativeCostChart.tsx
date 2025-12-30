import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Vehicle, MaintenanceItem, UnscheduledItem } from "@/lib/mockData";
import { Info, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface CumulativeCostChartProps {
  vehicle: Vehicle;
  horizonMiles?: number;
}

export default function CumulativeCostChart({ vehicle, horizonMiles = 60000 }: CumulativeCostChartProps) {
  const [horizon, setHorizon] = useState(horizonMiles);

  // 1. Generate Timeline Events
  const events = useMemo(() => {
    const currentMileage = vehicle.mileage;
    const maxMileage = currentMileage + horizon;
    let timelineEvents: { mile: number; cost: number; name: string; type: 'routine' | 'repair'; prob: number }[] = [];

    // A. Routine Maintenance
    // We need to project these forward.
    // If routineMaintenanceSchedule is simple, we might need to expand it.
    // For this mock, let's assume intervals from the mock data.
    const routineItems = vehicle.routineMaintenanceSchedule || [];
    
    routineItems.forEach(item => {
      // Find next occurrence
      // If we don't have last performed, assume it was done on schedule or due now?
      // Let's assume due at next interval multiple.
      const interval = item.intervalMiles;
      let nextMile = Math.ceil(currentMileage / interval) * interval;
      
      // If it's effectively due now (within 500 miles), put it at 0 relative (currentMileage)
      if (nextMile - currentMileage < 500) nextMile = currentMileage;

      while (nextMile <= maxMileage) {
        // Only add if it's in the future (or now)
        if (nextMile >= currentMileage) {
             timelineEvents.push({
            mile: nextMile,
            cost: item.costRange[1], // Use max cost for conservative estimate
            name: item.item,
            type: 'routine',
            prob: 1.0
          });
        }
        nextMile += interval;
      }
    });

    // B. Unscheduled / Risks
    const riskItems = vehicle.unscheduledForecast || [];
    riskItems.forEach(item => {
      // If the risk window starts within our horizon
      // The mock data has windowMin (absolute mileage).
      if (item.windowMin >= currentMileage && item.windowMin <= maxMileage) {
        timelineEvents.push({
          mile: item.windowMin,
          cost: item.costMax,
          name: item.name,
          type: 'repair',
          prob: item.probability
        });
      }
    });

    // C. Sort by mileage
    timelineEvents.sort((a, b) => a.mile - b.mile);

    return timelineEvents;
  }, [vehicle, horizon]);

  // 2. Build Cumulative Data Series
  const data = useMemo(() => {
    let cumulativeCost = 0;
    const currentMileage = vehicle.mileage;
    
    // Start point
    const points = [{
      mileage: currentMileage,
      mileageRelative: 0,
      cost: 0,
      event: "Start"
    }];
    
    // Add immediate jump if there's an event at relative 0
    const immediateEvents = events.filter(e => e.mile - currentMileage <= 0);
    if (immediateEvents.length > 0) {
        let immediateCost = 0;
        immediateEvents.forEach(e => {
            immediateCost += e.cost * e.prob;
        });
        
        cumulativeCost += immediateCost;
        
        points.push({
            mileage: currentMileage,
            mileageRelative: 0,
            cost: Math.round(cumulativeCost),
            event: "Immediate Maintenance"
        });
    }

    events.filter(e => e.mile - currentMileage > 0).forEach(e => {
      // Add expected cost (Cost * Prob)
      const expectedCost = e.cost * e.prob;
      cumulativeCost += expectedCost;

      points.push({
        mileage: e.mile,
        mileageRelative: e.mile - currentMileage,
        cost: Math.round(cumulativeCost),
        event: e.name // simplified, might be multiple events at same mile
      });
    });

    // Add final point at horizon if needed for visual completeness
    if (points[points.length - 1].mileageRelative < horizon) {
        points.push({
            mileage: currentMileage + horizon,
            mileageRelative: horizon,
            cost: Math.round(cumulativeCost),
            event: "End of Horizon"
        });
    }

    return points;
  }, [events, vehicle.mileage, horizon]);

  const totalProjectedCost = data.length > 0 ? data[data.length - 1].cost : 0;

  return (
    <Card className="border-border/60 shadow-sm w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
            <GlossaryTooltip term="Cumulative Cost" className="border-none gap-2 text-xl">Cumulative Ownership Cost</GlossaryTooltip>
            </CardTitle>
            <Badge variant="outline" className="font-mono text-sm">
                Max Projected: ${totalProjectedCost.toLocaleString()}
            </Badge>
        </div>
        <CardDescription>
          Projected maintenance and repair costs over the next {(horizon/1000).toFixed(0)}k miles.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Horizon Slider */}
        <div className="mb-6 px-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Ownership Horizon</span>
                <span className="font-bold text-foreground">{(horizon/1000).toFixed(0)}k miles</span>
            </div>
            <Slider 
                value={[horizon]} 
                min={10000} 
                max={100000} 
                step={5000} 
                onValueChange={(vals) => setHorizon(vals[0])}
                className="w-full"
            />
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis 
                dataKey="mileageRelative" 
                type="number"
                domain={[0, horizon]}
                tickFormatter={(val) => `+${(val/1000).toFixed(0)}k`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: "Miles Driven from Purchase", position: "bottom", offset: 0, fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
                width={40}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                            <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
                                <div className="font-bold mb-1 text-foreground">
                                    +{(pt.mileageRelative/1000).toFixed(1)}k miles
                                </div>
                                <div className="text-muted-foreground text-xs mb-2">
                                    Odometer: {(pt.mileage).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    <span className="font-bold text-lg">${pt.cost.toLocaleString()}</span>
                                </div>
                                {pt.event !== "Start" && pt.event !== "End of Horizon" && (
                                    <div className="text-xs text-muted-foreground border-t border-border/50 pt-2 mt-2">
                                        Trigger: <span className="font-medium text-foreground">{pt.event}</span>
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                }}
              />
              <Area 
                type="stepAfter" 
                dataKey="cost" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCost)" 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Everyday Speak & Technical Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                    <Info className="w-3 h-3" /> The Bottom Line
                </h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                    This line is the money you'll likely spend on upkeep as you drive. Jumps in the line mean scheduled work (like timing belts or tires) is hitting your wallet.
                </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Technical View
                </h4>
                <p className="text-sm text-foreground/80 leading-relaxed font-mono text-xs">
                    Cumulative expected maintenance/repair cost. Step increases occur at predicted service intervals and probability-weighted failure windows.
                </p>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
