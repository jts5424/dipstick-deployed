import React from "react";
import { Link } from "wouter";
import { 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  TrendingDown, 
  Zap, 
  Gauge,
  ShieldAlert,
  ShieldCheck,
  Shield,
  ArrowRight,
  Plus
} from "lucide-react";
import { Vehicle } from "@/lib/mockData";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface VehicleCardProps {
  vehicle: Vehicle;
  onCompareToggle?: (id: string, selected: boolean) => void;
  isSelectedForCompare?: boolean;
  onRunAnalysis?: (vehicleId: string) => void;
  hasFullAnalysis?: boolean;
}

export default function VehicleCard({ vehicle, onCompareToggle, isSelectedForCompare, onRunAnalysis, hasFullAnalysis = true }: VehicleCardProps) {
  const riskColor = 
    vehicle.scores.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
    vehicle.scores.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-800 border-amber-200' :
    'bg-red-100 text-red-800 border-red-200';
    
  const RiskIcon = 
    vehicle.scores.riskLevel === 'Low' ? ShieldCheck :
    vehicle.scores.riskLevel === 'Moderate' ? Shield :
    ShieldAlert;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 group">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {vehicle.imageUrl ? (
          <img 
            src={vehicle.imageUrl} 
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-foreground font-semibold shadow-sm border-white/20">
            {vehicle.scores.conditionScore}/100 Condition
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white font-medium text-sm drop-shadow-md">
           {vehicle.mileage.toLocaleString()} miles • {vehicle.location}
        </div>
      </div>

      <CardHeader className="pb-3 pt-4 relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-heading font-black leading-tight uppercase tracking-wide">
              {vehicle.year} {vehicle.make} <span className="text-primary">{vehicle.model}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium mt-1 font-mono">
              {vehicle.trim}
            </p>
          </div>
          <Badge variant="outline" className={`${riskColor} border-2 px-3 py-1.5 flex items-center gap-2 shadow-sm font-bold uppercase tracking-wider text-[10px]`}>
            <RiskIcon className="w-3.5 h-3.5" />
            {vehicle.scores.riskLevel} Risk
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-6 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border/50">
            <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest">Est. Total Loss (3Y)</p>
            <p className="text-2xl font-black tracking-tight text-foreground font-mono">
              ${vehicle.tco.totalLoss.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border/50">
            <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest">3-Year TCO</p>
            <p className="text-xl font-bold text-muted-foreground font-mono">
              ${vehicle.tco.totalCost.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-2 bg-gradient-to-br from-background to-muted/30 p-4 rounded-xl border border-border shadow-inner">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Top Leverage
              </span>
           </div>
          {vehicle.leverageItems.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-start gap-3 text-sm group/item">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] shrink-0" />
              <span className="text-foreground/80 font-medium leading-snug group-hover/item:text-foreground transition-colors">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <Separator className="opacity-50" />

      <CardFooter className="pt-4 flex gap-3 bg-muted/5 relative z-10">
        {hasFullAnalysis ? (
          <Link href={`/report/${vehicle.id}`} className="flex-1">
            <Button className="w-full font-bold shadow-md hover:shadow-lg group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-0.5" size="sm">
              View Analysis <ArrowRight className="w-4 h-4 ml-1.5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        ) : (
          onRunAnalysis && (
            <Button 
              onClick={() => onRunAnalysis(vehicle.id)}
              className="flex-1 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300" 
              size="sm"
            >
              <Activity className="w-4 h-4 mr-1.5" />
              Run Analysis
            </Button>
          )
        )}
        {onCompareToggle && (
          <div className="flex items-center">
             <Button 
                variant="outline"
                size="sm"
                onClick={() => onCompareToggle(vehicle.id, !isSelectedForCompare)}
                className={`transition-all duration-300 ${isSelectedForCompare ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 hover:text-white ring-2 ring-emerald-500/20" : "text-muted-foreground border-dashed hover:border-primary hover:text-primary"}`}
             >
                {isSelectedForCompare ? (
                    <>
                        <CheckCircle className="w-4 h-4 mr-1.5" /> Added
                    </>
                ) : (
                    <>
                        <Plus className="w-4 h-4 mr-1.5" /> Compare
                    </>
                )}
             </Button>
          </div>
        )}
      </CardFooter>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/5 rounded-xl transition-all duration-500 pointer-events-none" />
    </Card>
  );
}
