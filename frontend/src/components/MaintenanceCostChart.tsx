import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/lib/mockData";
import { Calendar, Gauge, TrendingUp } from "lucide-react";

interface MaintenanceCostChartProps {
  vehicle: Vehicle;
  milesPerYear?: number;
}

export default function MaintenanceCostChart({ vehicle, milesPerYear: defaultMilesPerYear = 12000 }: MaintenanceCostChartProps) {
  const [horizon, setHorizon] = useState(60000); // Default: 60k miles (or 5 years at 12k mi/yr)
  const [unit, setUnit] = useState<'miles' | 'years'>('miles');
  const [userMilesPerYear, setUserMilesPerYear] = useState(defaultMilesPerYear);
  
  // Reset horizon when switching units to reasonable defaults
  const handleUnitChange = (newUnit: 'miles' | 'years') => {
    if (newUnit === 'years' && unit === 'miles') {
      // Converting from miles to years - convert current horizon
      const yearsEquivalent = Math.round(horizon / userMilesPerYear);
      setHorizon(Math.min(20, Math.max(1, yearsEquivalent))); // Cap at 20 years
    } else if (newUnit === 'miles' && unit === 'years') {
      // Converting from years to miles - convert current horizon
      const milesEquivalent = horizon * userMilesPerYear;
      setHorizon(Math.min(100000, Math.max(10000, milesEquivalent))); // Cap at 100k miles
    }
    setUnit(newUnit);
  };

  // Use user input when years is selected, otherwise use default
  const effectiveMilesPerYear = unit === 'years' ? userMilesPerYear : defaultMilesPerYear;

  // Calculate horizon in miles based on unit
  const horizonMiles = unit === 'years' ? horizon * effectiveMilesPerYear : horizon;
  const horizonYears = unit === 'years' ? horizon : Math.round(horizon / effectiveMilesPerYear * 10) / 10;

  // Generate maintenance events based on gap analysis
  const maintenanceEvents = useMemo(() => {
    const currentMileage = vehicle.mileage;
    const maxMileage = currentMileage + horizonMiles;
    const events: { mile: number; cost: number; name: string; year: number }[] = [];

    // Use gapAnalysis items to project future maintenance
    vehicle.gapAnalysis.items.forEach((item: any) => {
      const intervalMiles = item.intervalMiles || 0;
      if (intervalMiles === 0) return;

      // Parse next due mileage from the gap analysis data
      // The gap analysis already calculated when this item is next due based on service history
      const parseNextDueMiles = (nextDueStr: string): number | null => {
        if (!nextDueStr || nextDueStr === 'N/A') return null;
        // Format: "60000 miles (2021-01-01)" or just "60000 miles"
        const match = nextDueStr.match(/([\d,]+)\s*miles/);
        return match ? parseInt(match[1].replace(/,/g, '')) : null;
      };

      // Calculate using the correct formula: delta = (lastDoneMiles || 0) + intervalMiles - currentMileage
      const lastDoneMiles = item.lastDoneMiles !== null && item.lastDoneMiles !== undefined ? item.lastDoneMiles : 0;
      const delta = lastDoneMiles + intervalMiles - currentMileage;
      
      // If delta < 0, it's overdue. If delta >= 0, it's due in delta miles
      const isOverdue = delta < 0;
      
      if (isOverdue) {
        // Schedule overdue items at current mileage (immediate cost)
        const overdueByMiles = Math.abs(delta);
        const immediateCost = item.costRange ? (item.costRange[0] + item.costRange[1]) / 2 : 0;
        
        // Show overdue amount in the name
        const overdueText = lastDoneMiles === 0
          ? ' (Never performed)'
          : ` (${overdueByMiles.toLocaleString()} mi overdue)`;
        
        events.push({
          mile: currentMileage, // Due NOW (immediate)
          cost: immediateCost,
          name: `${item.item}${overdueText}`,
          year: 0
        });
      }

      // Calculate next due mileage for future projections
      // If overdue, after fixing it now, next is lastDoneMiles + intervalMiles (or currentMileage + intervalMiles if never done)
      // If not overdue, next is lastDoneMiles + intervalMiles
      let nextDueMile = lastDoneMiles > 0 
        ? lastDoneMiles + intervalMiles
        : currentMileage + intervalMiles;
      
      // If overdue and the next due is still in the past, move it forward
      if (isOverdue && nextDueMile <= currentMileage) {
        nextDueMile = currentMileage + intervalMiles;
      }
      
      // Project all future occurrences within horizon
      // Each occurrence is exactly one interval after the previous one
      while (nextDueMile <= maxMileage) {
        if (nextDueMile > currentMileage) {
          const milesFromNow = nextDueMile - currentMileage;
          const yearsFromNow = milesFromNow / effectiveMilesPerYear;
          
          events.push({
            mile: nextDueMile,
            cost: item.costRange ? (item.costRange[0] + item.costRange[1]) / 2 : 0,
            name: item.item,
            year: yearsFromNow
          });
        }
        // Move to next occurrence (one interval later)
        nextDueMile += intervalMiles;
      }
    });

    // Sort by mileage (so steps occur in chronological order)
    events.sort((a, b) => a.mile - b.mile);

    return events;
  }, [vehicle, horizonMiles, effectiveMilesPerYear]);

  // Build cumulative cost data points
  const data = useMemo(() => {
    const currentMileage = vehicle.mileage;
    let cumulativeCost = 0;
    const points: { 
      mileage: number; 
      mileageRelative: number; 
      yearsRelative: number;
      cost: number; 
      event?: string;
    }[] = [];

    // Start point
    points.push({
      mileage: currentMileage,
      mileageRelative: 0,
      yearsRelative: 0,
      cost: 0,
      event: "Start"
    });

    // Add immediate costs (overdue items)
    const immediateEvents = maintenanceEvents.filter(e => e.mile <= currentMileage);
    if (immediateEvents.length > 0) {
      immediateEvents.forEach(e => {
        cumulativeCost += e.cost;
      });
      points.push({
        mileage: currentMileage,
        mileageRelative: 0,
        yearsRelative: 0,
        cost: Math.round(cumulativeCost),
        event: "Immediate Maintenance"
      });
    }

    // Add future events
    maintenanceEvents.filter(e => e.mile > currentMileage).forEach(e => {
      cumulativeCost += e.cost;
      points.push({
        mileage: e.mile,
        mileageRelative: e.mile - currentMileage,
        yearsRelative: e.year,
        cost: Math.round(cumulativeCost),
        event: e.name
      });
    });

    // Add final point at horizon
    if (points.length > 0 && points[points.length - 1].mileageRelative < horizonMiles) {
      points.push({
        mileage: currentMileage + horizonMiles,
        mileageRelative: horizonMiles,
        yearsRelative: horizonYears,
        cost: Math.round(cumulativeCost),
        event: "End of Horizon"
      });
    }

    return points;
  }, [maintenanceEvents, vehicle.mileage, horizonMiles, horizonYears]);

  const totalProjectedCost = data.length > 0 ? data[data.length - 1].cost : 0;

  return (
    <Card className="border-border/60 shadow-sm w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Maintenance Cost Outlook
          </CardTitle>
          <Badge variant="outline" className="font-mono text-sm">
            Total: ${totalProjectedCost.toLocaleString()}
          </Badge>
        </div>
        <CardDescription>
          Cumulative routine maintenance costs over the next {unit === 'miles' 
            ? `${(horizon/1000).toFixed(0)}k miles` 
            : `${horizon} year${horizon !== 1 ? 's' : ''}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Unit Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={unit === 'miles' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleUnitChange('miles')}
            className="flex items-center gap-2"
          >
            <Gauge className="w-4 h-4" />
            Miles
          </Button>
          <Button
            variant={unit === 'years' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleUnitChange('years')}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Years
          </Button>
        </div>

        {/* Miles per Year Input - Only show when years is selected */}
        {unit === 'years' && (
          <div className="mb-4 px-2">
            <Label htmlFor="miles-per-year" className="text-xs text-muted-foreground mb-2 block">
              Miles per Year
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="miles-per-year"
                type="number"
                min="1000"
                max="50000"
                step="1000"
                value={userMilesPerYear}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || defaultMilesPerYear;
                  setUserMilesPerYear(Math.max(1000, Math.min(50000, value)));
                }}
                className="w-32 text-sm"
              />
              <span className="text-xs text-muted-foreground">miles/year</span>
            </div>
          </div>
        )}

        {/* Horizon Slider */}
        <div className="mb-6 px-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Time Horizon</span>
            <span className="font-bold text-foreground">
              {unit === 'miles' 
                ? `${(horizon/1000).toFixed(0)}k miles` 
                : `${horizon} year${horizon !== 1 ? 's' : ''}`}
              {unit === 'miles' && ` (${horizonYears.toFixed(1)} years)`}
            </span>
          </div>
          <Slider 
            value={[horizon]} 
            min={unit === 'miles' ? 10000 : 1} 
            max={unit === 'miles' ? 100000 : 20} 
            step={unit === 'miles' ? 5000 : 1} 
            onValueChange={(vals) => setHorizon(vals[0])}
            className="w-full"
          />
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis 
                dataKey={unit === 'miles' ? "mileageRelative" : "yearsRelative"}
                type="number"
                domain={[0, unit === 'miles' ? horizonMiles : horizonYears]}
                tickFormatter={(val) => {
                  if (unit === 'miles') {
                    return `+${(val/1000).toFixed(0)}k`;
                  } else {
                    return `+${val.toFixed(1)}y`;
                  }
                }}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: unit === 'miles' ? "Miles from Now" : "Years from Now", 
                  position: "bottom", 
                  offset: 0, 
                  fill: "hsl(var(--muted-foreground))", 
                  fontSize: 12 
                }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                width={50}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
                        <div className="font-bold mb-1 text-foreground">
                          {unit === 'miles' 
                            ? `+${(pt.mileageRelative/1000).toFixed(1)}k miles`
                            : `+${pt.yearsRelative.toFixed(1)} years`}
                        </div>
                        <div className="text-muted-foreground text-xs mb-2">
                          Odometer: {pt.mileage.toLocaleString()} mi
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="font-bold text-lg">${pt.cost.toLocaleString()}</span>
                        </div>
                        {pt.event && pt.event !== "Start" && pt.event !== "End of Horizon" && (
                          <div className="text-xs text-muted-foreground border-t border-border/50 pt-2 mt-2">
                            Next: <span className="font-medium text-foreground">{pt.event}</span>
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
                fill="url(#colorMaintenance)" 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
            <div className="text-xs font-bold uppercase text-muted-foreground mb-1">
              Total Projected Cost
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${totalProjectedCost.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Over {unit === 'miles' ? `${(horizon/1000).toFixed(0)}k miles` : `${horizon} year${horizon !== 1 ? 's' : ''}`}
            </div>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
            <div className="text-xs font-bold uppercase text-muted-foreground mb-1">
              Average Annual Cost
            </div>
            <div className="text-2xl font-bold text-foreground">
              ${horizonYears > 0 ? Math.round(totalProjectedCost / horizonYears).toLocaleString() : '0'}
            </div>
            {unit === 'years' && (
              <div className="text-xs text-muted-foreground mt-1">
                Based on {userMilesPerYear.toLocaleString()} mi/year
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              Per year
            </div>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
            <div className="text-xs font-bold uppercase text-muted-foreground mb-1">
              Maintenance Events
            </div>
            <div className="text-2xl font-bold text-foreground">
              {maintenanceEvents.filter(e => e.mile > vehicle.mileage).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Scheduled services
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

