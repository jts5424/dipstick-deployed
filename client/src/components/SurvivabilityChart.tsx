import React, { useState } from "react";
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
  ComposedChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnscheduledItem } from "@/lib/mockData";
import { GlossaryTooltip } from "./GlossaryTooltip";
import { 
  Activity, 
  BarChart3, 
  List, 
  Info, 
  AlertTriangle, 
  ChevronRight, 
  X,
  History,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Wrench
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface SurvivabilityChartProps {
  items: UnscheduledItem[];
  currentMileage: number;
}

export default function SurvivabilityChart({ items, currentMileage }: SurvivabilityChartProps) {
  const [selectedItem, setSelectedItem] = useState<UnscheduledItem | null>(null);

  // Generate curve data
  const dataPoints = [];
  const startMile = 0;
  const endMile = 150000;
  const step = 5000;

  for (let mile = startMile; mile <= endMile; mile += step) {
    const point: any = { mileage: mile };
    
    items.forEach(item => {
      const center = (item.windowMin + item.windowMax) / 2;
      const width = (item.windowMax - item.windowMin) / 2;
      
      const exponent = -0.5 * Math.pow((mile - center) / (width * 0.6), 2);
      const prob = item.probability * Math.exp(exponent);
      
      point[item.name] = prob * 100;
    });

    dataPoints.push(point);
  }

  // Sort by probability for Top Risks
  const sortedRisks = [...items].sort((a, b) => b.probability - a.probability);
  const topRisks = sortedRisks.slice(0, 3); // Top 3 for curve
  const allRisks = sortedRisks; // All for tiles

  const colors = [
    "hsl(var(--destructive))", // Red
    "hsl(var(--chart-4))",     // Amber
    "hsl(var(--primary))",      // Navy
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#06b6d4", // Cyan
  ];

  const getColor = (index: number) => colors[index % colors.length];

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-2xl">
             <GlossaryTooltip term="Survivability" className="border-none gap-2">Component Survivability Analysis</GlossaryTooltip>
          </CardTitle>
          <CardDescription className="text-base">
            Projected unscheduled maintenance events based on mileage and model history.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Explainer Section */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 mb-6">
            <h4 className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-400 text-sm uppercase tracking-wide mb-2">
                <Info className="w-4 h-4" /> How to read this chart
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground/80 leading-relaxed">
                <p>
                    <span className="font-bold">Unscheduled Maintenance:</span> Unlike oil changes, these are parts that fail unexpectedly.
                </p>
                <p>
                    <span className="font-bold">Probability Zones:</span> The curves show the "danger zone" for each part. Higher peaks = higher failure rate at that mileage.
                </p>
            </div>
        </div>

        {/* The Chart */}
        <div className="h-[350px] w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={dataPoints}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <defs>
                {topRisks.map((item, index) => (
                  <linearGradient key={`grad-${item.id}`} id={`color-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getColor(index)} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={getColor(index)} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="mileage" 
                type="number" 
                domain={[0, 150000]}
                tickFormatter={(val) => `${val/1000}k`}
                fontSize={12}
                label={{ value: 'Vehicle Mileage', position: 'bottom', offset: 0 }}
              />
              <YAxis 
                unit="%" 
                fontSize={12}
                label={{ value: 'Failure Probability', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Risk']}
                labelFormatter={(label) => `${label.toLocaleString()} miles`}
                contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
              />
              
              <ReferenceLine x={currentMileage} stroke="hsl(var(--foreground))" strokeDasharray="3 3" label="You are here" />

              {topRisks.map((item, index) => (
                <Area 
                  key={item.id}
                  type="monotone" 
                  dataKey={item.name} 
                  stroke={getColor(index)} 
                  fill={`url(#color-${item.id})`} 
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Top Risks Tiles */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" /> Top Risks Detected
                </h3>
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Click for details</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {allRisks.map((item, i) => (
                    <div 
                        key={item.id} 
                        className="group relative bg-card hover:bg-muted/50 border border-border/60 hover:border-primary/50 p-4 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                        onClick={() => setSelectedItem(item)}
                    >
                        {/* Color Indicator */}
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ backgroundColor: i < 3 ? getColor(i) : 'hsl(var(--muted-foreground))' }} />
                        
                        <h4 className="font-bold text-sm pr-6 mb-1 group-hover:text-primary transition-colors">{item.name}</h4>
                        <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="text-xs text-muted-foreground font-medium">Risk Score:</span>
                            <Badge variant={item.probability > 0.2 ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0 h-5">
                                {(item.probability * 100).toFixed(0)}/100
                            </Badge>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Est. Cost</span>
                                <span className="font-mono font-bold">${item.costMin.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Risk Window</span>
                                <span className="font-medium">{(item.windowMin/1000).toFixed(0)}k - {(item.windowMax/1000).toFixed(0)}k mi</span>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-end text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                            Analyze Risk <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Drilldown Modal */}
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {selectedItem && (
                    <>
                        <DialogHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <DialogTitle className="text-2xl font-heading font-bold flex items-center gap-3">
                                        {selectedItem.name}
                                        <Badge variant={selectedItem.probability > 0.2 ? "destructive" : "outline"} className="text-sm">
                                            Risk: {(selectedItem.probability * 100).toFixed(0)}%
                                        </Badge>
                                    </DialogTitle>
                                    <DialogDescription className="mt-1.5 text-base">
                                        Projected failure between {(selectedItem.windowMin/1000).toFixed(0)}k - {(selectedItem.windowMax/1000).toFixed(0)}k miles.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                            {/* 1. Why it matters */}
                            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                                <h4 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary" /> Why it fails
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {/* Mock dynamic text based on component name */}
                                    {selectedItem.name.includes("Gasket") 
                                        ? "Seals harden over time due to heat cycles, leading to oil leaks onto hot engine components. Common in this model year."
                                        : selectedItem.name.includes("Pump")
                                        ? "Plastic impellers become brittle and crack, or bearings seize. Failure can cause immediate overheating."
                                        : selectedItem.name.includes("Chain")
                                        ? "Tensioners lose hydraulic pressure or guides wear out, causing 'death rattle' on startup and potential engine timing failure."
                                        : "Internal wear and tear consistent with mileage. Critical component for vehicle operation."
                                    }
                                </p>
                            </div>

                            {/* 2. Mini Chart */}
                            <div className="h-48 w-full bg-card border border-border/50 rounded-lg p-4">
                                <div className="text-xs font-bold text-muted-foreground mb-2 text-center">Failure Probability Curve: {selectedItem.name}</div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dataPoints}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="mileage" hide />
                                        <YAxis hide domain={[0, 'auto']} />
                                        <Tooltip labelFormatter={(v) => `${v} miles`} formatter={(v: number) => [`${v.toFixed(1)}%`, 'Prob']} />
                                        <ReferenceLine x={currentMileage} stroke="hsl(var(--foreground))" strokeDasharray="3 3" />
                                        <Line 
                                            type="monotone" 
                                            dataKey={selectedItem.name} 
                                            stroke={colors[allRisks.findIndex(r => r.id === selectedItem.id) % colors.length]} 
                                            strokeWidth={3} 
                                            dot={false} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* 3. Service History Impact (Dynamic) */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-bold">Service History Impact</h3>
                                </div>
                                <Separator />
                                
                                <div className="grid gap-4">
                                    {/* Replacement Check */}
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 bg-muted p-1.5 rounded text-muted-foreground">
                                            <Wrench className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Last Replacement</div>
                                            {selectedItem.probability > 0.25 ? (
                                                <>
                                                    <div className="text-sm text-muted-foreground">
                                                        No record of replacement found in history. You are running on the original factory part.
                                                    </div>
                                                    <div className="mt-1 text-xs font-bold text-amber-600">
                                                        Impact: High Risk (Clock not restarted)
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-sm text-muted-foreground">
                                                        Service records indicate replacement at 58,000 miles. 
                                                    </div>
                                                    <div className="mt-1 text-xs font-bold text-emerald-600">
                                                        Impact: Low Risk (Clock restarted)
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Usage Context */}
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 bg-muted p-1.5 rounded text-muted-foreground">
                                            <TrendingDown className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Usage Context</div>
                                            <div className="text-sm text-muted-foreground">
                                                Vehicle averaged 8,500 miles/year (Low). Low mileage can sometimes accelerate rubber seal degradation due to sitting.
                                            </div>
                                            <div className="mt-1 text-xs font-bold text-muted-foreground">
                                                Impact: Neutral
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signals */}
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 bg-muted p-1.5 rounded text-muted-foreground">
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Related Signals</div>
                                            <div className="text-sm text-muted-foreground">
                                                2 service gap(s) detected in 2019-2022. Regular fluid changes may have been missed, increasing stress on this component.
                                            </div>
                                            <div className="mt-1 text-xs font-bold text-amber-600">
                                                Impact: Increases Likelihood
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Net Takeaway */}
                            <div className="bg-slate-900 text-white p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Takeaway</div>
                                    <div className="font-bold text-lg">More likely to fail than average</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400">Projected Cost</div>
                                    <div className="font-mono font-bold text-xl text-emerald-400">${selectedItem.costMin} - ${selectedItem.costMax}</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
