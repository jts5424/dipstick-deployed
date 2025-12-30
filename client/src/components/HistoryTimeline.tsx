import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot,
  Scatter,
  ComposedChart,
  ReferenceArea
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ServiceRecord } from "@/lib/mockData";
import { format, parseISO, isValid } from 'date-fns';
import { Calendar, Gauge, Wrench, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface HistoryTimelineProps {
  records: ServiceRecord[];
  className?: string;
}

// Helper to get plain English explanation
function getPlainEnglishExplanation(category: string, description: string): string {
  const desc = description.toLowerCase();
  
  if (category === 'maintenance') {
    if (desc.includes('oil')) return "Engine health check. Regular oil changes keep the engine running smoothly.";
    if (desc.includes('filter')) return "Breathing check. New filters help the car run efficiently and keep air clean.";
    if (desc.includes('fluid')) return "Vital fluids check. Keeps brakes, steering, and transmission working safely.";
    if (desc.includes('spark') || desc.includes('plug')) return "Ignition tune-up. Ensures the engine fires properly and saves gas.";
    if (desc.includes('belt')) return "Critical part replacement. Prevents sudden breakdown of steering or charging.";
    return "Routine upkeep. Essential for long-term reliability.";
  }
  
  if (category === 'repair') {
    if (desc.includes('brake')) return "Safety fix. Worn brakes were replaced to ensure safe stopping.";
    if (desc.includes('pump')) return "Major part fix. A failing pump was replaced to prevent overheating or failure.";
    if (desc.includes('leak')) return "Leak fix. Stopped fluid loss that could damage the engine or messy driveway.";
    if (desc.includes('suspension') || desc.includes('shock') || desc.includes('strut')) return "Ride quality fix. Improved handling and comfort.";
    return "Something broke and was fixed. Good that it was addressed!";
  }
  
  if (category === 'tire') {
    if (desc.includes('replace')) return "New shoes. Fresh tires improve safety, grip, and gas mileage.";
    if (desc.includes('rotate')) return "Even wear check. Extends the life of the tires.";
    if (desc.includes('pressure')) return "Safety check. Proper inflation prevents blowouts and saves gas.";
    return "Tire care. important for safety and handling.";
  }
  
  if (category === 'inspection') {
    return "Health check-up. A pro looked it over to find any hidden issues.";
  }
  
  if (category === 'admin') {
    if (desc.includes('title')) return "Paperwork update. Ownership documents were processed.";
    if (desc.includes('registration')) return "Legal update. Tags were renewed.";
    if (desc.includes('sale') || desc.includes('sold')) return "Changed hands. The car was bought or sold.";
    return "Record keeping event.";
  }
  
  return "Service event logged in history.";
}

export default function HistoryTimeline({ records, className }: HistoryTimelineProps) {
  // 1. Process Data
  const data = React.useMemo(() => {
    // Filter records with valid date and mileage
    const validRecords = records
      .filter(r => r.date && r.mileage !== null && r.mileage > 0)
      .map(r => {
        let categoryColor = "hsl(var(--muted-foreground))";
        let categoryIcon = FileText;
        
        switch(r.category) {
            case 'maintenance':
                categoryColor = "#10b981"; // emerald-500
                categoryIcon = Wrench;
                break;
            case 'repair':
                categoryColor = "#f59e0b"; // amber-500
                categoryIcon = AlertTriangle;
                break;
            case 'tire':
                categoryColor = "#3b82f6"; // blue-500
                categoryIcon = Gauge;
                break;
            case 'inspection':
                categoryColor = "#8b5cf6"; // violet-500
                categoryIcon = CheckCircle2;
                break;
            case 'admin':
                categoryColor = "#64748b"; // slate-500
                categoryIcon = FileText;
                break;
        }

        return {
            ...r,
            // Ensure date parsing handles different formats if needed, but mock data is YYYY-MM-DD
            dateObj: new Date(r.date).getTime(), // Use timestamp for Recharts number axis
            mileage: Number(r.mileage),
            year: new Date(r.date).getFullYear(),
            formattedDate: format(new Date(r.date), 'MMM d, yyyy'),
            categoryColor,
            categoryIcon,
            plainEnglish: getPlainEnglishExplanation(r.category, r.description)
        };
      })
      .sort((a, b) => a.dateObj - b.dateObj);

    return validRecords;
  }, [records]);

  // 2. Define Narrated Periods (Mock Logic - in production this would be algorithmically generated)
  // Logic: Break into ownership chunks or time chunks
  const periods = React.useMemo(() => {
    if (data.length === 0) return [];
    
    // We'll create 3 "narrative" blocks based on the data shape we know
    const p1End = new Date('2019-01-01').getTime();
    const p2Start = new Date('2019-01-01').getTime();
    const p2End = new Date('2023-01-01').getTime();
    const p3Start = new Date('2023-01-01').getTime();
    
    // Calculate stats for periods
    const p1Stats = {
        count: data.filter(d => d.dateObj <= p1End).length,
        years: 4
    };
    
    const p3Stats = {
        count: data.filter(d => d.dateObj >= p3Start).length,
        years: 2
    };
    
    return [
        {
            x1: data[0].dateObj,
            x2: p1End,
            label: "Consistent Care (2015-2018)",
            narrative: `High-frequency maintenance at authorized dealers. Service intervals averaged 8 months. Major services (30k, 60k) completed on schedule. This is the ideal ownership period.`,
            color: "rgba(16, 185, 129, 0.1)", // green-500/10
            textColor: "#059669"
        },
        {
            x1: p2Start,
            x2: p2End,
            label: "No Service History (2019-2022)",
            narrative: "48-month gap with zero recorded entries. Mileage increased by ~22,000 miles during this blind spot. Risk of sludge buildup and deferred wear items like belts and fluids.",
            color: "rgba(220, 38, 38, 0.2)", // red-600/20 - darker red
            textColor: "#b91c1c"
        },
        {
            x1: p3Start,
            x2: data[data.length - 1].dateObj, // Ensure it covers the last point
            label: "Resumed Service (2023-Present)",
            narrative: `Aggressive catch-up maintenance. 7 records in 18 months indicating the new owner is addressing the previous gap. Critical systems (brakes, tires) addressed, but long-term effects of the gap remain unknown.`,
            color: "rgba(59, 130, 246, 0.1)", // blue-500/10
            textColor: "#2563eb"
        }
    ];
  }, [data]);

  if (data.length === 0) return null;

  // Custom Dot Component to render different colors based on category
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={5} 
        stroke="white" 
        strokeWidth={2} 
        fill={payload.categoryColor} 
        className="transition-all hover:r-8 cursor-pointer"
      />
    );
  };

  return (
    <Card className={`border-border/60 shadow-sm w-full ${className}`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <GlossaryTooltip term="Usage History" className="border-none gap-2 text-xl">Vehicle Usage History</GlossaryTooltip>
                </CardTitle>
                <CardDescription>
                Visualizing every service event in the vehicle's life.
                </CardDescription>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Maintenance
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Repair
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Tires
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Inspection
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              
              {/* Reference Areas for Periods */}
              {periods.map((p, i) => (
                  <ReferenceArea 
                    key={i} 
                    x1={p.x1} 
                    x2={p.x2} 
                    fill={p.color} 
                    fillOpacity={1}
                  >
                  </ReferenceArea>
              ))}

              {/* X-Axis: Date (Bottom) */}
              <XAxis 
                dataKey="dateObj" 
                scale="time" 
                type="number" 
                domain={['dataMin', 'dataMax']}
                tickFormatter={(unixTime) => format(new Date(unixTime), 'yyyy')}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                label={{ value: "Date", position: "bottom", offset: 0, fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />

              {/* Y-Axis: Mileage (Left/Topish) */}
              <YAxis 
                dataKey="mileage" 
                tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={40}
                label={{ value: "Mileage", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />

              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    const Icon = pt.categoryIcon || FileText;
                    
                    return (
                      <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-sm max-w-[280px] z-50">
                        <div className="font-bold mb-1.5 text-foreground flex items-center justify-between gap-4">
                           <span className="flex items-center gap-2">
                             <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                             {pt.formattedDate}
                           </span>
                           <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium capitalize" style={{ backgroundColor: pt.categoryColor }}>
                                {pt.category}
                           </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2 font-mono text-muted-foreground border-b border-border/50 pb-2">
                           <Gauge className="w-3.5 h-3.5" />
                           {(pt.mileage).toLocaleString()} mi
                        </div>
                        <div className="text-sm font-medium text-foreground leading-snug">
                           {pt.description}
                        </div>
                        <div className="mt-2 pt-2 border-t border-border/50">
                           <div className="text-[10px] font-bold uppercase text-muted-foreground mb-0.5">What it means:</div>
                           <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium italic">
                             "{pt.plainEnglish}"
                           </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                           <span className="opacity-70">Location:</span> {pt.location}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* The Line - subtle connector */}
              <Line 
                type="monotone" 
                dataKey="mileage" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                strokeOpacity={0.3}
                dot={false}
                activeDot={false}
              />

              {/* The Dots - The main event */}
              <Scatter 
                data={data} 
                shape={<CustomDot />}
                name="Service Events"
              />

            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Narrative Summary Below Chart */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/50 pt-4">
            {periods.map((p, i) => (
                <div key={i} className="flex flex-col gap-1">
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: p.textColor }}>
                        {p.label}
                    </div>
                    <div className="text-sm text-muted-foreground leading-snug">
                        {p.narrative}
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
