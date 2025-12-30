import React, { useState } from "react";
import { TrendingDown, Info, CheckCircle2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GlossaryTooltip } from "./GlossaryTooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DepreciationChartProps {
  data: { mileage: number; retailValue: number; privateValue: number }[];
  currentMileage: number;
  projectedLoss?: number;
  ownershipYears?: number;
  annualMileage?: number;
}

export default function DepreciationChart({ 
  data, 
  currentMileage, 
  projectedLoss,
  ownershipYears = 3,
  annualMileage = 12000
}: DepreciationChartProps) {
  const [showPrivate, setShowPrivate] = useState(true);

  // Find closest data point for current value
  const currentValuation = data.find(d => Math.abs(d.mileage - currentMileage) < 5000) || data[0];
  
  // Calculate Horizon
  const horizonMiles = currentMileage + (ownershipYears * annualMileage);
  // Find projected value (simple linear interpolation or closest point)
  const horizonPoint = data.reduce((prev, curr) => 
    Math.abs(curr.mileage - horizonMiles) < Math.abs(prev.mileage - horizonMiles) ? curr : prev
  );
  
  // Recalculate loss based on horizon
  const calculatedLoss = currentValuation.retailValue - horizonPoint.retailValue;
  const displayLoss = projectedLoss || calculatedLoss;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
             <GlossaryTooltip term="Depreciation" className="border-none gap-2 text-xl">Projected Depreciation</GlossaryTooltip>
          </CardTitle>
          <CardDescription>
            Estimated value retention over your ownership horizon ({ownershipYears} yrs @ {annualMileage.toLocaleString()}/yr)
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border border-border/40">
           <Label htmlFor="private-mode" className="text-xs font-medium cursor-pointer">Retail Only</Label>
           <Switch id="private-mode" checked={showPrivate} onCheckedChange={setShowPrivate} />
           <Label htmlFor="private-mode" className="text-xs font-medium cursor-pointer">Show Private</Label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis 
                dataKey="mileage" 
                tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  fontSize: '14px',
                  boxShadow: 'var(--shadow-md)'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="retailValue" 
                name="Retail Value"
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              {showPrivate && (
                <Line 
                  type="monotone" 
                  dataKey="privateValue" 
                  name="Private Party"
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
              {/* Start Point */}
              <ReferenceDot 
                x={currentValuation?.mileage} 
                y={currentValuation?.retailValue} 
                r={6} 
                fill="hsl(var(--primary))" 
                stroke="white"
                strokeWidth={2}
                label={{ position: 'top', value: 'You Are Here', fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 'bold' }}
              />
              
              {/* Horizon Point */}
              <ReferenceDot 
                x={horizonPoint?.mileage} 
                y={horizonPoint?.retailValue} 
                r={6} 
                fill="hsl(var(--destructive))" 
                stroke="white"
                strokeWidth={2}
                label={{ position: 'bottom', value: 'Ownership Horizon', fill: 'hsl(var(--muted-foreground))', fontSize: 11, dy: 10 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Readout */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-3 text-center border border-border/50">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Projected Value</div>
                <div className="text-lg font-mono font-bold">${horizonPoint?.retailValue.toLocaleString()}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center border border-border/50">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Depreciation</div>
                <div className="text-lg font-mono font-bold text-destructive">-${displayLoss.toLocaleString()}</div>
            </div>
        </div>

        {/* Interpretation Footer */}
        <div className="pt-4 border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                        <Info className="w-3 h-3" /> How to read this
                    </h4>
                    <p className="text-sm text-muted-foreground leading-snug">
                        The curve shows how fast this car loses money. The steeper the slope, the more it costs you to own.
                    </p>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase text-emerald-600 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> What it means
                    </h4>
                    <p className="text-sm leading-snug">
                        This model is hitting its depreciation "knee" - the curve is flattening out, meaning the previous owner paid for the biggest drop in value, not you.
                    </p>
                </div>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
