import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { getComparison, Vehicle } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Crown, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight,
  X,
  Plus,
  ArrowUpRight,
  DollarSign,
  ShieldAlert,
  Zap
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Line,
  Cell,
  ReferenceDot
} from "recharts";

// Add this new component outside the main component or in a separate file
function DriversDrawer({ vehicle, isOpen }: { vehicle: Vehicle, isOpen: boolean }) {
  if (!isOpen) return null;
  
  return (
    <div className="w-full border-t bg-muted/10 p-4 animate-in slide-in-from-top-2 duration-200">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
             <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" /> Top Risks
             </h4>
             <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                   <span className="text-muted-foreground">Timing chain tensioner failure risk</span>
                </li>
                <li className="flex items-start gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                   <span className="text-muted-foreground">Water pump housing cracks</span>
                </li>
             </ul>
          </div>
          
          <div className="space-y-2">
             <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                <Zap className="w-3 h-3" /> Service Gaps
             </h4>
             <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">2 gaps</span> detected in history.
                Last service was <span className="font-medium text-foreground">8 months ago</span>.
             </div>
          </div>

          <div className="space-y-2">
             <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" /> Recalls
             </h4>
             <div className="text-sm text-muted-foreground">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                   <CheckCircle2 className="w-3 h-3" /> No open recalls
                </span>
                Verified via NHTSA database.
             </div>
          </div>
       </div>
    </div>
  );
}

function ExplainBlock({ 
  simple, 
  technical 
}: { 
  simple: { whatYouSee: string, whatItMeans: string, bottomLine: string },
  technical: { definition: string, interpretation: string, bottomLine: string }
}) {
  const [mode, setMode] = useState<'simple' | 'technical'>('simple');

  return (
    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50 text-sm space-y-3 transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
               <Info className="w-3 h-3" /> Explain this chart
            </span>
            <div className="flex items-center bg-muted rounded-full p-0.5 border">
                <button 
                   onClick={() => setMode('simple')}
                   className={`px-3 py-0.5 text-[10px] font-bold rounded-full transition-all ${mode === 'simple' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                   Simple
                </button>
                <button 
                   onClick={() => setMode('technical')}
                   className={`px-3 py-0.5 text-[10px] font-bold rounded-full transition-all ${mode === 'technical' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                   Technical
                </button>
            </div>
        </div>
        
        {mode === 'simple' ? (
           <div className="space-y-3 animate-in fade-in duration-300">
               <div>
                   <span className="font-bold text-foreground block mb-1 text-xs uppercase tracking-wide opacity-70">What you're looking at</span>
                   <p className="text-muted-foreground leading-relaxed">{simple.whatYouSee}</p>
               </div>
               <div>
                   <span className="font-bold text-foreground block mb-1 text-xs uppercase tracking-wide opacity-70">What it means for you</span>
                   <p className="text-foreground leading-relaxed font-medium">{simple.whatItMeans}</p>
               </div>
               <div className="pt-2 border-t border-border/50">
                   <p className="font-bold text-emerald-700 dark:text-emerald-400 leading-snug flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {simple.bottomLine}
                   </p>
               </div>
           </div>
        ) : (
           <div className="space-y-3 animate-in fade-in duration-300">
               <div>
                   <span className="font-bold text-foreground block mb-1 text-xs uppercase tracking-wide opacity-70">Definition</span>
                   <p className="text-muted-foreground leading-relaxed font-mono text-xs">{technical.definition}</p>
               </div>
               <div>
                   <span className="font-bold text-foreground block mb-1 text-xs uppercase tracking-wide opacity-70">Interpretation</span>
                   <p className="text-foreground leading-relaxed font-mono text-xs">{technical.interpretation}</p>
               </div>
               <div className="pt-2 border-t border-border/50">
                   <p className="font-bold text-foreground leading-snug font-mono text-xs flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 mt-0.5" />
                      {technical.bottomLine}
                   </p>
               </div>
           </div>
        )}
    </div>
  )
}

export default function Compare() {
  const [location, setLocation] = useLocation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };
  const query = new URLSearchParams(window.location.search);
  const urlIds = query.get("ids")?.split(",").filter(Boolean) || [];
  // Default to demo vehicles if no IDs provided
  const ids = urlIds.length > 0 ? urlIds : ['audi-s7-2015', 'audi-a6-2018'];
  
  const rawVehicles = getComparison(ids);
  
  // State for live calculations
  const [period, setPeriod] = useState(3);
  const [annualMileage, setAnnualMileage] = useState(12000);
  const [prices, setPrices] = useState<Record<string, number>>(
    rawVehicles.reduce((acc, v) => ({ ...acc, [v.id]: v.tco.askingPrice }), {})
  );

  const handlePriceChange = (id: string, price: number) => {
    setPrices(prev => ({ ...prev, [id]: price }));
  };

  const handleRemoveVehicle = (idToRemove: string) => {
    const newIds = ids.filter(id => id !== idToRemove);
    setLocation(`/compare?ids=${newIds.join(",")}`);
  };

  // Live recalculation of TCO based on inputs
  const vehicles = useMemo(() => rawVehicles.map(v => {
    const userPrice = prices[v.id] ?? v.tco.askingPrice;
    const priceDelta = userPrice - v.tco.askingPrice;
    
    // Simple scaling factors for the prototype
    const timeFactor = period / 3; // Base data is 3 years
    const mileageFactor = annualMileage / 12000; // Base data is 12k/yr
    
    // Adjust components
    const adjustedDepreciation = v.tco.depreciationLoss * timeFactor * (0.8 + 0.2 * mileageFactor);
    const adjustedMaintenance = v.tco.routineMaintenanceCost * timeFactor * mileageFactor;
    const adjustedRepairs = v.tco.expectedUnscheduledRepairCost * timeFactor * (0.5 + 0.5 * mileageFactor * 1.1);
    const immediateCost = v.tco.immediateCostBurden;

    const newTotalLoss = adjustedDepreciation + adjustedMaintenance + adjustedRepairs + immediateCost + priceDelta;
    const expectedSalePrice = userPrice - adjustedDepreciation;

    return {
      ...v,
      tco: {
        ...v.tco,
        askingPrice: userPrice,
        totalLoss: newTotalLoss,
        depreciationLoss: adjustedDepreciation,
        routineMaintenanceCost: adjustedMaintenance,
        expectedUnscheduledRepairCost: adjustedRepairs,
        totalCost: newTotalLoss + userPrice,
        expectedSalePrice: expectedSalePrice
      }
    };
  }).sort((a, b) => a.tco.totalLoss - b.tco.totalLoss), [rawVehicles, prices, period, annualMileage]); // Sort by TCO (lowest first)

  const bestDeal = vehicles[0];
  const worstDeal = vehicles[vehicles.length - 1];

  // Chart Data Preparation - Filtered for top 4 to avoid spaghetti
  const topVehiclesForCharts = vehicles.slice(0, 4);

  const chartData = topVehiclesForCharts.map(v => ({
    name: `${v.year} ${v.model}`,
    "Total Loss": Math.round(v.tco.totalLoss),
    "Depreciation": Math.round(v.tco.depreciationLoss),
    "Maintenance": Math.round(v.tco.routineMaintenanceCost + v.tco.immediateCostBurden),
    "Repairs": Math.round(v.tco.expectedUnscheduledRepairCost),
  }));

  // Depreciation Lines Data
  const depreciationData = [];
  const maxYears = period; 
  
  for (let year = 0; year <= maxYears; year++) {
    const depPoint: any = { year: `Year ${year}` };
    topVehiclesForCharts.forEach(v => {
      const startValue = prices[v.id] ?? v.tco.askingPrice;
      const endValue = startValue - v.tco.depreciationLoss;
      const yearlyDepreciation = (startValue - endValue) / period;
      const currentValue = Math.max(0, startValue - (yearlyDepreciation * year));
      depPoint[`${v.year} ${v.model}`] = Math.round(currentValue);
    });
    depreciationData.push(depPoint);
  }

  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#6366f1"]; 

  // --- LOGIC ENGINE FOR EXPLAINERS ---
  const explanations = useMemo(() => {
    if (vehicles.length === 0) return null;

    const winner = bestDeal;
    const runnerUp = vehicles[1] || worstDeal; // Fallback
    
    const MONEY_TIE_THRESHOLD = 250;

    function fmtMoney(n: number) {
        return Math.round(Math.abs(n)).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    }

    function roughlySame(n: number) {
        return Math.abs(n) < MONEY_TIE_THRESHOLD;
    }

    // A) Depreciation (Value Loss)
    const depDelta = Math.abs(winner.tco.depreciationLoss - runnerUp.tco.depreciationLoss);
    const winnerRetainsMore = winner.tco.depreciationLoss < runnerUp.tco.depreciationLoss;
    const isDepTie = roughlySame(winner.tco.depreciationLoss - runnerUp.tco.depreciationLoss);

    // Simple - Depreciation
    const depSimple = {
        whatYouSee: "This shows how much each car is expected to be worth over time.",
        whatItMeans: winnerRetainsMore 
            ? `Higher line = keeps value better. ${winner.model} keeps about ${fmtMoney(depDelta)} more value.`
            : isDepTie 
                ? "If the lines are close, value loss isn’t the deciding factor."
                : `${runnerUp.model} actually holds value better, but ${winner.model} wins on total cost.`,
        bottomLine: isDepTie
            ? "Value is basically tied — use 3-Year Cost and repair risk to decide."
            : `If you want to resell later, ${winner.model} puts ${fmtMoney(depDelta)} more back in your pocket.`
    };

    // Technical - Depreciation
    const depTechnical = {
        definition: "Projected resale value trajectory across the ownership horizon.",
        interpretation: `Horizon delta at year ${period}: ${fmtMoney(depDelta)}. ${winnerRetainsMore ? 'Winner retains more.' : 'Runner-up retains more.'}`,
        bottomLine: "Value loss contribution to TCO is primarily depreciation; use horizon deltas for ranking."
    };

    // B) TCO (3-Year Cost)
    const tcoDelta = Math.abs(winner.tco.totalLoss - runnerUp.tco.totalLoss);
    const isTcoTie = roughlySame(winner.tco.totalLoss - runnerUp.tco.totalLoss);
    
    const deltas = [
        { label: "value loss", delta: Math.abs(winner.tco.depreciationLoss - runnerUp.tco.depreciationLoss) },
        { label: "routine upkeep", delta: Math.abs(winner.tco.routineMaintenanceCost - runnerUp.tco.routineMaintenanceCost) },
        { label: "repairs", delta: Math.abs(winner.tco.expectedUnscheduledRepairCost - runnerUp.tco.expectedUnscheduledRepairCost) }
    ].sort((a, b) => b.delta - a.delta);
    const biggestDriver = deltas[0];

    // Simple - TCO
    const tcoSimple = {
        whatYouSee: `This shows where your money goes: value loss, routine upkeep, and repairs.`,
        whatItMeans: `Shorter bar = cheaper to own. ${winner.model} costs about ${fmtMoney(tcoDelta)} less overall.`,
        bottomLine: isTcoTie 
            ? "Costs are basically tied — pick the one with lower repair risk."
            : `If you want to spend less over ${period} years, pick ${winner.model}.`
    };

    // Technical - TCO
    const tcoTechnical = {
        definition: "TCO decomposition: Depreciation + Routine Maintenance + Unscheduled Repairs.",
        interpretation: `Total ΔCost vs #2 = ${fmtMoney(tcoDelta)}. Primary driver = ${biggestDriver.label} (Δ ${fmtMoney(biggestDriver.delta)}).`,
        bottomLine: "Component deltas explain ranking sensitivity."
    };

    // C) Scorecard
    // Map raw scores to comparable values
    const winScore = {
        retention: 100 - (winner.tco.depreciationLoss / (prices[winner.id] ?? winner.tco.askingPrice) * 100),
        reliability: winner.scores.riskLevel === 'Low' ? 3 : winner.scores.riskLevel === 'Moderate' ? 2 : 1,
        maint: -winner.tco.routineMaintenanceCost, // Negative because lower cost is better
        condition: winner.scores.conditionScore,
        deal: winner.scores.dealScore
    };
    const runScore = {
        retention: 100 - (runnerUp.tco.depreciationLoss / (prices[runnerUp.id] ?? runnerUp.tco.askingPrice) * 100),
        reliability: runnerUp.scores.riskLevel === 'Low' ? 3 : runnerUp.scores.riskLevel === 'Moderate' ? 2 : 1,
        maint: -runnerUp.tco.routineMaintenanceCost,
        condition: runnerUp.scores.conditionScore,
        deal: runnerUp.scores.dealScore
    };

    const categories = [
        { key: "retention", label: "Holds Value" },
        { key: "reliability", label: "Reliability" },
        { key: "maint", label: "Routine Upkeep" },
        { key: "condition", label: "Condition" },
        { key: "deal", label: "Deal Rating" }
    ];

    const winnerWins = categories.filter(c => winScore[c.key as keyof typeof winScore] > runScore[c.key as keyof typeof runScore]).map(c => c.label);
    const runnerWins = categories.filter(c => runScore[c.key as keyof typeof winScore] > winScore[c.key as keyof typeof winScore]).map(c => c.label);

    // Simple - Scorecard
    const scoreSimple = {
        whatYouSee: "A quick report card. Higher is better.",
        whatItMeans: `${winner.model} is stronger on ${winnerWins.slice(0, 2).join(", ")}.`,
        bottomLine: runnerWins.length > 0 
            ? `Pick ${winner.model} for ${winnerWins[0]}. Pick ${runnerUp.model} if ${runnerWins[0]} matters most.`
            : `Pick ${winner.model} unless you have a specific preference not shown here.`
    };

    // Technical - Scorecard
    const scoreTechnical = {
        definition: "Normalized category scores (0–100) across value retention, reliability, maintenance economy, condition, deal rating.",
        interpretation: `Winner leads in ${winnerWins.length} of ${categories.length} categories; weakness is ${runnerWins[0] || 'none'}.`,
        bottomLine: "Use category weighting if user preference differs from default."
    };

    return {
        depreciation: { simple: depSimple, technical: depTechnical },
        tco: { simple: tcoSimple, technical: tcoTechnical },
        scorecard: { simple: scoreSimple, technical: scoreTechnical }
    };

  }, [bestDeal, vehicles, period, prices]);

  // --- TAKEAWAY LOGIC (New) ---
  const takeaway = useMemo(() => {
        if (vehicles.length < 2) return null;
        
        const winner = bestDeal;
        const runnerUp = vehicles[1]; // Ensure at least 2 cars exist for this
        const MONEY_TIE_THRESHOLD = 250;

        function fmtMoney(n: number) {
             return Math.round(Math.abs(n)).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
        }

        // 1. Deltas
        const deltaTco = runnerUp.tco.totalLoss - winner.tco.totalLoss; // Positive = winner cheaper
        const deltaRepairRisk = runnerUp.tco.expectedUnscheduledRepairCost - winner.tco.expectedUnscheduledRepairCost; // Positive = winner safer

        const tcoPhrase = Math.abs(deltaTco) < MONEY_TIE_THRESHOLD 
            ? "costs are basically tied" 
            : `${fmtMoney(deltaTco)} less`;
            
        const repairPhrase = Math.abs(deltaRepairRisk) < MONEY_TIE_THRESHOLD
            ? "repair risk is similar"
            : `${fmtMoney(deltaRepairRisk)} less`;

        // 2. Runner-Up Strength
        const getCondition = (v: Vehicle) => v.scores.conditionScore;
        const getUpkeep = (v: Vehicle) => v.tco.routineMaintenanceCost;
        const getRetention = (v: Vehicle) => v.tco.depreciationLoss;
        const getDeal = (v: Vehicle) => v.scores.dealScore;

        const candidates = [
            { key: "condition", label: "condition score", better: "higher", w: getCondition(winner), r: getCondition(runnerUp) },
            { key: "routineUpkeep", label: "routine upkeep", better: "lower", w: getUpkeep(winner), r: getUpkeep(runnerUp) },
            { key: "depreciation", label: "value retention", better: "lower", w: getRetention(winner), r: getRetention(runnerUp) },
            { key: "dealRating", label: "deal rating", better: "higher", w: getDeal(winner), r: getDeal(runnerUp) }
        ];

        let bestCandidate = candidates[0];
        let maxAdvantage = -Infinity;

        candidates.forEach(c => {
            let advantage = 0;
            if (c.key === 'condition' || c.key === 'dealRating') {
                advantage = c.r - c.w; 
            } else {
                // For costs (lower better), advantage = winner - runnerUp. 
                // e.g. winner=3000, runner=2500 -> 3000-2500 = 500 (positive means winner is worse, runner is better)
                // We want runner advantage. 
                // If runner is 2500 and winner is 3000, runner is better by 500.
                advantage = (c.w - c.r) / 100; // Scaled
            }
            
            if (advantage > maxAdvantage) {
                maxAdvantage = advantage;
                bestCandidate = c;
            }
        });

        let runnerUpStrengthLabel = bestCandidate.label;
        if (maxAdvantage < 1) { 
             runnerUpStrengthLabel = "one specific category you care about most";
        }

        // 3. Watch-outs
        function getWatchout(v: Vehicle) {
            const openRecall = v.recalls?.some(r => r.status === 'Open');
            if (openRecall) return "recall status isn’t verified — confirm completion before closing";

            const gaps = v.expertAnalysis?.gaps || [];
            const hasMajorGap = gaps.some(g => g.concern === 'High' || g.concern === 'Medium');
            if (hasMajorGap) return "verify the service history gap with receipts";

            if (v.expertAnalysis?.confidenceScore === 'Low') return "mileage reporting is inconsistent — verify usage/records";

            if (v.scores.riskLevel === 'High') return "higher repair risk — budget or negotiate";

            return "no major red flags detected — still verify key maintenance receipts";
        }

        return {
            winner: {
                id: winner.id,
                name: `${winner.year} ${winner.model}`,
                deltaTco: tcoPhrase,
                deltaRepair: repairPhrase,
                watchout: getWatchout(winner)
            },
            runnerUp: {
                name: `${runnerUp.year} ${runnerUp.model}`,
                strength: runnerUpStrengthLabel,
                costMore: fmtMoney(Math.abs(deltaTco)),
                watchout: getWatchout(runnerUp)
            },
            period: period
        };
  }, [bestDeal, vehicles, period]);

  if (vehicles.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">No vehicles found</h2>
          <Button onClick={() => setLocation('/')} className="mt-4">Return to Garage</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        
        {/* 1. COMPARE SET CONTROLS (Sticky) */}
        <section className="bg-background/80 backdrop-blur-xl border-b sticky top-0 z-40 -mx-4 px-4 sm:-mx-8 sm:px-8 py-4 shadow-sm transition-all duration-200">
           <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
              
              {/* Left: Scrollable Pills */}
              <div className="flex-1 w-full xl:w-auto min-w-0">
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 xl:pb-0 no-scrollbar mask-gradient-right">
                     {vehicles.map((v) => (
                        <div key={v.id} className="flex items-center gap-2 bg-muted/50 border rounded-full pl-1 pr-3 py-1 shrink-0 group hover:bg-muted hover:border-primary/30 transition-colors">
                            {/* Tiny thumbnail */}
                            <div className="w-8 h-8 rounded-full bg-background overflow-hidden shrink-0 border">
                               {v.imageUrl && <img src={v.imageUrl} className="w-full h-full object-cover" alt="" />}
                            </div>
                            
                            <div className="flex flex-col leading-none">
                                <span className="font-bold text-sm whitespace-nowrap">{v.year} {v.model}</span>
                                <div className="flex items-center gap-1">
                                   <span className="text-[10px] text-muted-foreground">$</span>
                                   <input 
                                      className="bg-transparent text-[10px] font-mono w-14 outline-none border-b border-transparent focus:border-primary text-muted-foreground focus:text-foreground"
                                      value={prices[v.id] ?? v.tco.askingPrice}
                                      onChange={(e) => handlePriceChange(v.id, Number(e.target.value))}
                                      type="number"
                                   />
                                </div>
                            </div>

                            <button 
                                onClick={() => handleRemoveVehicle(v.id)}
                                className="ml-1 text-muted-foreground hover:text-destructive p-0.5 rounded-full hover:bg-background transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                     ))}
                     
                     <Button variant="outline" size="sm" className="rounded-full h-10 px-4 border-dashed text-muted-foreground shrink-0 hover:text-foreground hover:border-primary/50">
                        <Plus className="w-4 h-4 mr-1" /> Add
                     </Button>
                  </div>
              </div>

              {/* Right: Inputs & Action */}
              <div className="flex items-center gap-6 shrink-0 w-full xl:w-auto justify-end border-t xl:border-t-0 pt-4 xl:pt-0">
                 {/* Compact Inputs */}
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                       <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ownership</label>
                       <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-sm">{period} yrs</span>
                          <Input 
                            type="range" min="1" max="10" step="1" 
                            value={period} onChange={(e) => setPeriod(Number(e.target.value))}
                            className="w-16 h-1.5 p-0 bg-secondary accent-primary cursor-pointer" 
                          />
                       </div>
                    </div>
                    <div className="w-px h-8 bg-border/60" />
                    <div className="flex flex-col items-end">
                       <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mileage</label>
                       <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-sm">{(annualMileage/1000).toFixed(0)}k/yr</span>
                          <Input 
                            type="range" min="5000" max="30000" step="1000" 
                            value={annualMileage} onChange={(e) => setAnnualMileage(Number(e.target.value))}
                            className="w-16 h-1.5 p-0 bg-secondary accent-primary cursor-pointer" 
                          />
                       </div>
                    </div>
                 </div>

                 <Button className="h-10 px-6 font-bold shadow-md bg-foreground text-background hover:bg-foreground/90 rounded-full">
                    Compare {vehicles.length > 2 && `(${vehicles.length})`} <ArrowRight className="ml-2 w-4 h-4" />
                 </Button>
              </div>
           </div>
        </section>

        {/* 2. LEADERBOARD (Ranked Results) */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-heading">Ranked Results</h2>
              <Badge variant="outline" className="font-mono text-xs">Sorted by {period}-Year Cost</Badge>
           </div>
           
           <div className="grid gap-4">
              {vehicles.map((v, index) => {
                 const isWinner = index === 0;
                 return (
                    <div 
                        key={v.id} 
                        onClick={() => toggleExpand(v.id)}
                        className={`relative group rounded-xl border transition-all duration-300 cursor-pointer ${
                            isWinner 
                            ? "bg-emerald-500/5 border-emerald-500/30 shadow-sm hover:shadow-md" 
                            : "bg-card hover:bg-muted/30"
                        }`}
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6 p-4">
                        {/* Rank */}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 ${isWinner ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" : "bg-muted text-muted-foreground"}`}>
                           {index + 1}
                        </div>

                        {/* Vehicle Info */}
                        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0 border">
                                {v.imageUrl && <img src={v.imageUrl} className="w-full h-full object-cover" alt="" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    {v.year} {v.model}
                                    {isWinner && <Badge className="bg-emerald-500 text-white border-0 text-[10px] px-1.5 py-0 h-5">WINNER</Badge>}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                    <Badge variant="outline" className="font-normal text-xs bg-muted/50 border-border">Dipstick {v.scores.dipstickScore}</Badge>
                                    <span>•</span>
                                    <span className={v.scores.riskLevel === 'Low' ? "text-emerald-600 font-medium" : v.scores.riskLevel === 'High' ? "text-destructive font-medium" : "text-amber-600 font-medium"}>{v.scores.riskLevel} Risk</span>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto text-center md:text-left">
                           <div className="space-y-1">
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{period}-Yr Cost</div>
                              <div className="font-mono font-bold text-lg">${Math.round(v.tco.totalLoss).toLocaleString()}</div>
                           </div>
                           <div className="space-y-1">
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Value Loss</div>
                              <div className="font-mono text-sm text-muted-foreground">-${Math.round(v.tco.depreciationLoss).toLocaleString()}</div>
                           </div>
                           <div className="space-y-1">
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Repair Risk</div>
                              <div className="font-mono text-sm text-muted-foreground">-${Math.round(v.tco.expectedUnscheduledRepairCost).toLocaleString()}</div>
                           </div>
                           <div className="space-y-1">
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Savings</div>
                              <div className={`font-mono font-bold text-lg ${index === 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                                 {index === 0 
                                    ? `+$${Math.round(worstDeal.tco.totalLoss - v.tco.totalLoss).toLocaleString()}`
                                    : `-$${Math.round(v.tco.totalLoss - bestDeal.tco.totalLoss).toLocaleString()}`
                                 }
                              </div>
                           </div>
                        </div>

                        {/* Action */}
                        <div className="flex flex-col items-end justify-center min-h-[40px]">
                            <Button 
                               variant={expandedId === v.id ? "secondary" : "ghost"}
                               size="sm" 
                               className="shrink-0 text-xs font-bold gap-1.5 h-8 w-full md:w-auto"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 toggleExpand(v.id);
                               }}
                            >
                                {expandedId === v.id ? "Hide Analysis" : "View Analysis"}
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedId === v.id ? "rotate-90" : ""}`} />
                            </Button>
                        </div>
                    </div>
                    
                    {/* Expanded Drawer */}
                    <DriversDrawer vehicle={v} isOpen={expandedId === v.id} />
                  </div>
                 );
              })}
           </div>

           {/* SMART ANALYSIS SECTION RESTORED */}
           <div className="bg-background border rounded-xl p-8 shadow-sm mt-8">
              <h3 className="font-heading font-bold text-2xl mb-6 flex items-center gap-2">
                 <Info className="w-6 h-6 text-primary" /> Smart Analysis
              </h3>
              
              <div className="space-y-6">
                 <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-muted-foreground">
                       Based on a {period}-year ownership period at {annualMileage.toLocaleString()} miles/year, the 
                       <strong className="text-foreground"> {bestDeal.year} {bestDeal.model}</strong> emerges as the mathematically superior option.
                       It offers the lowest 3-Year Cost, saving you <strong className="text-emerald-600">${Math.round(worstDeal.tco.totalLoss - bestDeal.tco.totalLoss).toLocaleString()}</strong> compared to the lowest-ranked vehicle.
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Comparative Insight Cards */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                       <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                          <TrendingDown className="w-4 h-4" /> Value Loss Shield
                       </h4>
                       <p className="text-sm text-blue-900/80 dark:text-blue-200/80 leading-snug">
                          At {period} years, the {bestDeal.model} is projected to be worth <strong>${Math.round(prices[bestDeal.id] ?? bestDeal.tco.askingPrice - bestDeal.tco.depreciationLoss).toLocaleString()}</strong>, 
                          retaining <strong>{Math.round((worstDeal.tco.depreciationLoss - bestDeal.tco.depreciationLoss)) < 250 ? 'roughly the same' : `$${Math.round((worstDeal.tco.depreciationLoss - bestDeal.tco.depreciationLoss)).toLocaleString()} more`}</strong> equity than the {worstDeal.model}.
                       </p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30">
                       <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Repair Risk
                       </h4>
                       <p className="text-sm text-amber-900/80 dark:text-amber-200/80 leading-snug">
                          Repair risk delta: <strong>${(worstDeal.tco.expectedUnscheduledRepairCost - bestDeal.tco.expectedUnscheduledRepairCost).toLocaleString()} lower</strong>. The {bestDeal.model} is statistically safer from large unscheduled bills.
                       </p>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-border/50">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                       <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Key Drivers for Winner
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* Simplified Key Drivers Logic */}
                       <div className="flex items-start justify-between gap-4 p-3 bg-muted/20 rounded-lg border border-border/40 hover:bg-muted/40 transition-colors group">
                           <div className="flex gap-3">
                               <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full p-0.5 shrink-0">
                                   <CheckCircle2 className="w-3.5 h-3.5" />
                               </div>
                               <div>
                                   <div className="text-sm font-bold text-foreground">Lowest Cost</div>
                                   <div className="text-xs text-muted-foreground mt-0.5 leading-snug">Best overall financial performance.</div>
                               </div>
                           </div>
                           <div className="text-right shrink-0">
                               <div className="font-mono font-bold text-emerald-600 text-sm">#1 Rank</div>
                           </div>
                       </div>
                       
                       {bestDeal.scores.riskLevel === 'Low' && (
                           <div className="flex items-start justify-between gap-4 p-3 bg-muted/20 rounded-lg border border-border/40 hover:bg-muted/40 transition-colors group relative">
                               <div className="flex gap-3">
                                   <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full p-0.5 shrink-0">
                                       <CheckCircle2 className="w-3.5 h-3.5" />
                                   </div>
                                   <div>
                                       <div className="text-sm font-bold text-foreground">Low Risk Profile</div>
                                       <div className="text-xs text-muted-foreground mt-0.5 leading-snug">High reliability score.</div>
                                       <a href="#tco-chart" className="text-[10px] font-medium text-primary mt-1 inline-flex items-center hover:underline">
                                           View evidence <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                                       </a>
                                   </div>
                               </div>
                               <div className="text-right shrink-0">
                                   <div className="font-mono font-bold text-emerald-600 text-sm">Safe Bet</div>
                               </div>
                           </div>
                       )}

                       {bestDeal.tco.routineMaintenanceCost < worstDeal.tco.routineMaintenanceCost && (
                           <div className="flex items-start justify-between gap-4 p-3 bg-muted/20 rounded-lg border border-border/40 hover:bg-muted/40 transition-colors group relative">
                               <div className="flex gap-3">
                                   <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full p-0.5 shrink-0">
                                       <CheckCircle2 className="w-3.5 h-3.5" />
                                   </div>
                                   <div>
                                       <div className="text-sm font-bold text-foreground">Upkeep Efficiency</div>
                                       <div className="text-xs text-muted-foreground mt-0.5 leading-snug">Lower scheduled costs.</div>
                                       <a href="#tco-chart" className="text-[10px] font-medium text-primary mt-1 inline-flex items-center hover:underline">
                                           View evidence <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                                       </a>
                                   </div>
                               </div>
                               <div className="text-right shrink-0">
                                   <div className="font-mono font-bold text-emerald-600 text-sm">Save ${Math.round(worstDeal.tco.routineMaintenanceCost - bestDeal.tco.routineMaintenanceCost)}</div>
                               </div>
                           </div>
                       )}

                        {/* Value Retention Driver (if applicable, adding explicit check to show it as a driver if winner wins here too) */}
                        {bestDeal.tco.depreciationLoss < worstDeal.tco.depreciationLoss && (
                           <div className="flex items-start justify-between gap-4 p-3 bg-muted/20 rounded-lg border border-border/40 hover:bg-muted/40 transition-colors group relative">
                               <div className="flex gap-3">
                                   <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full p-0.5 shrink-0">
                                       <CheckCircle2 className="w-3.5 h-3.5" />
                                   </div>
                                   <div>
                                       <div className="text-sm font-bold text-foreground">Value Retention</div>
                                       <div className="text-xs text-muted-foreground mt-0.5 leading-snug">Holds equity better.</div>
                                       <a href="#depreciation-chart" className="text-[10px] font-medium text-primary mt-1 inline-flex items-center hover:underline">
                                           View evidence <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                                       </a>
                                   </div>
                               </div>
                               <div className="text-right shrink-0">
                                   <div className="font-mono font-bold text-emerald-600 text-sm">Save ${Math.round(worstDeal.tco.depreciationLoss - bestDeal.tco.depreciationLoss)}</div>
                               </div>
                           </div>
                       )}

                    </div>
                 </div>

                 {/* TAKEAWAY SECTION */}
                 {takeaway && (
                    <div className="mt-6 pt-6 border-t border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                        <div className="flex items-center gap-2 mb-4">
                            <h4 className="font-heading font-bold text-lg">Takeaway</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h5 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Best for you if...</h5>
                                
                                <div className="space-y-3">
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                        <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">
                                            Pick {takeaway.winner.name} if:
                                        </div>
                                        <ul className="text-sm text-emerald-900/80 dark:text-emerald-200/80 space-y-1 list-disc list-inside">
                                            <li>You want the lowest <strong>{takeaway.period}-year cost</strong> (about <strong>{takeaway.winner.deltaTco}</strong> than {takeaway.runnerUp.name}).</li>
                                            <li>You prefer <strong>lower surprise repair risk</strong> (about <strong>{takeaway.winner.deltaRepair}</strong> exposure).</li>
                                        </ul>
                                    </div>

                                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="font-bold text-foreground text-sm mb-1">
                                            Pick {takeaway.runnerUp.name} if:
                                        </div>
                                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                            <li>You care most about <strong>{takeaway.runnerUp.strength}</strong>.</li>
                                            <li>You’re okay paying <strong>{takeaway.runnerUp.costMore} more</strong> to get that advantage.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col">
                                <h5 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Watch-outs</h5>
                                
                                <div className="space-y-3 flex-1">
                                    <div className="text-sm">
                                        <strong className="text-foreground block mb-0.5">{takeaway.winner.name} watch-out:</strong>
                                        <span className="text-muted-foreground">{takeaway.winner.watchout}</span>
                                    </div>
                                    <div className="text-sm">
                                        <strong className="text-foreground block mb-0.5">{takeaway.runnerUp.name} watch-out:</strong>
                                        <span className="text-muted-foreground">{takeaway.runnerUp.watchout}</span>
                                    </div>
                                </div>

                                <div className="pt-2 mt-auto">
                                    <h5 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">Next step</h5>
                                    <Button 
                                        className="w-full justify-between group bg-primary text-primary-foreground hover:bg-primary/90" 
                                        size="lg"
                                        onClick={() => setLocation(`/report/${takeaway.winner.id}?mode=offer&tab=leverage`)}
                                    >
                                        Generate negotiation plan
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2 text-center">
                                        Uses the top leverage points from {takeaway.winner.name} and your risk tolerance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* 3. CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Depreciation Curve */}
            <Card id="depreciation-chart" className="scroll-mt-24">
                <CardHeader>
                    <CardTitle className="text-lg">Depreciation Curves (Top 4)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={depreciationData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                                    tickFormatter={(value) => `$${value/1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                                    itemStyle={{ color: "hsl(var(--foreground))" }}
                                />
                                <Legend />
                                {topVehiclesForCharts.map((v, i) => (
                                    <Line 
                                        key={v.id}
                                        type="monotone" 
                                        dataKey={`${v.year} ${v.model}`} 
                                        stroke={colors[i % colors.length]} 
                                        strokeWidth={i === 0 ? 3 : 2}
                                        dot={(props) => {
                                            const { cx, cy, index, payload } = props;
                                            // Show dot for Year 0 and Horizon Year (last point)
                                            if (index === 0 || index === period) {
                                                return (
                                                    <circle 
                                                        key={`dot-${index}`} 
                                                        cx={cx} 
                                                        cy={cy} 
                                                        r={5} 
                                                        fill={colors[i % colors.length]} 
                                                        stroke="white" 
                                                        strokeWidth={2} 
                                                    />
                                                );
                                            }
                                            return <></>;
                                        }}
                                        activeDot={{ r: 6 }}
                                    />
                                ))}
                                <ReferenceDot x={`Year 0`} y={0} r={0} label={{ value: "You are here", position: "top", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                                <ReferenceDot x={`Year ${period}`} y={0} r={0} label={{ value: "Ownership Horizon", position: "top", fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {explanations && (
                        <ExplainBlock 
                            simple={explanations.depreciation.simple}
                            technical={explanations.depreciation.technical}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Performance Scorecard (Radar) -> TCO Breakdown */}
            <Card id="tco-chart" className="scroll-mt-24">
                <CardHeader>
                    <CardTitle className="text-lg">{period}-Year Cost Breakdown (Top 4)</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="h-[300px] mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                 <XAxis type="number" hide />
                                 <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} interval={0} />
                                 <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                                 />
                                 <Legend />
                                 <Bar dataKey="Depreciation" stackId="a" fill={colors[0]} radius={[0, 0, 0, 0]} barSize={20} />
                                 <Bar dataKey="Maintenance" stackId="a" fill={colors[1]} radius={[0, 0, 0, 0]} barSize={20} />
                                 <Bar dataKey="Repairs" stackId="a" fill={colors[2]} radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                         </ResponsiveContainer>
                     </div>

                    {explanations && (
                        <ExplainBlock 
                            simple={explanations.tco.simple}
                            technical={explanations.tco.technical}
                        />
                    )}
                </CardContent>
            </Card>
        </div>

        {/* 4. PERFORMANCE SCORECARD (Table) */}
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Vehicle</th>
                                <th className="px-4 py-3">Value Retention</th>
                                <th className="px-4 py-3">Reliability</th>
                                <th className="px-4 py-3">Routine Upkeep</th>
                                <th className="px-4 py-3">Condition</th>
                                <th className="px-4 py-3 rounded-tr-lg">Deal Rating</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {vehicles.map((v, i) => (
                                <tr key={v.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0 border">
                                            {v.imageUrl && <img src={v.imageUrl} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                        {v.year} {v.model}
                                        {i === 0 && <Crown className="w-3 h-3 text-emerald-500 ml-1" />}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${Math.max(20, 100 - (v.tco.depreciationLoss / (prices[v.id] ?? v.tco.askingPrice) * 100 * 1.5))}%` }} />
                                            </div>
                                            <span className="font-mono text-xs text-muted-foreground">{Math.round(Math.max(20, 100 - (v.tco.depreciationLoss / (prices[v.id] ?? v.tco.askingPrice) * 100 * 1.5)))}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className={v.scores.riskLevel === 'Low' ? "text-emerald-600 bg-emerald-50/50" : "text-amber-600 bg-amber-50/50"}>
                                            {v.scores.riskLevel}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-muted-foreground">
                                        ${Math.round(v.tco.routineMaintenanceCost).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-emerald-600">
                                            {v.scores.conditionScore} <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-bold">
                                        {v.scores.dealScore}/100
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {explanations && (
                    <ExplainBlock 
                        simple={explanations.scorecard.simple}
                        technical={explanations.scorecard.technical}
                    />
                )}
            </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
