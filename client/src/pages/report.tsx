import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRoute, useLocation } from "wouter";
import Layout from "@/components/Layout";
import MissionBriefing from "@/components/MissionBriefing";
import { getVehicle } from "@/lib/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  DollarSign, 
  TrendingDown, 
  ShieldAlert, 
  Info,
  ChevronRight,
  MessageSquare,
  FileText,
  Printer,
  ChevronLeft,
  Zap,
  CheckCircle2,
  Bug,
  Sparkles,
  Activity,
  Calculator,
  HandCoins,
  ShieldCheck,
  Share2,
  Check,
  Calendar,
  Clock,
  History,
  Loader2,
  XCircle,
  ExternalLink,
  Mail,
  Lock
} from "lucide-react";
import { Label } from "@/components/ui/label";

import MetricCard from "@/components/MetricCard";
import IssueCard from "@/components/IssueCard";
import LeverageDrawer from "@/components/LeverageDrawer";
import DepreciationChart from "@/components/DepreciationChart";
import TcoBreakdownChart from "@/components/TcoBreakdownChart";
import EvidenceTable from "@/components/EvidenceTable";
import SurvivabilityChart from "@/components/SurvivabilityChart";
import CumulativeCostChart from "@/components/CumulativeCostChart";
import HistoryTimeline from "@/components/HistoryTimeline";
import RiskUrgencyMap from "@/components/RiskUrgencyMap";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import ReportPDF from "@/components/ReportPDF";

function RecallValidationCard({ recalls, vin }: { recalls: {
    id: string;
    campaignNumber: string;
    component: string;
    summary: string;
    consequence: string;
    remedy: string;
    status: 'Open' | 'Closed' | 'Fixed';
    date: string;
  }[], vin: string }) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'complete'>('idle');
  const [result, setResult] = useState<'verified' | 'incomplete' | 'unknown' | null>(null);

  const handleValidate = () => {
    setStatus('checking');
    setTimeout(() => {
      setStatus('complete');
      // Simulate result based on mock data logic or random
      setResult('incomplete'); // As requested: "likely incomplete" is a good default for "risk" demo
    }, 2000);
  };

  if (!recalls || recalls.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-red-500 shadow-md animate-in slide-in-from-bottom-2">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
           <AlertTriangle className="w-5 h-5" /> Open Recall Detected
        </CardTitle>
        <CardDescription>VIN Check: {vin}</CardDescription>
      </CardHeader>
      <CardContent>
         {recalls.map(recall => (
            <div key={recall.id} className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
               <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                  <div className="font-bold text-red-700 dark:text-red-400">{recall.component}</div>
                  <Badge variant="outline" className="border-red-200 text-red-600 bg-white shrink-0">Campaign {recall.campaignNumber}</Badge>
               </div>
               <p className="text-sm text-foreground mb-3 leading-relaxed">{recall.summary}</p>
               <div className="bg-white/50 p-2 rounded text-xs text-muted-foreground border border-red-100/50">
                 <span className="font-bold text-red-700">Remedy:</span> {recall.remedy}
               </div>
            </div>
         ))}

         <div className="flex flex-col sm:flex-row items-center gap-4">
            {status === 'idle' && (
               <Button onClick={handleValidate} className="bg-red-600 hover:bg-red-700 text-white font-bold w-full sm:w-auto shadow-sm">
                  Validate Recall Completion
               </Button>
            )}
            
            {status === 'checking' && (
               <Button disabled className="w-full sm:w-auto bg-red-600/80 text-white">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying with OEM...
               </Button>
            )}

            {status === 'complete' && result === 'incomplete' && (
               <div className="w-full bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                     <div className="font-bold text-red-800">Status: Likely Incomplete</div>
                     <p className="text-sm text-red-700 mt-1 leading-relaxed">
                        OEM database indicates this recall has not been closed. 
                        <span className="font-bold block mt-1">Recommended Action: Request proof of completion or reduce offer by $500 (inconvenience).</span>
                     </p>
                  </div>
               </div>
            )}
         </div>
      </CardContent>
    </Card>
  )
}

// New QuickSummary Component
function QuickSummary({ 
   title, 
   verdict, 
   details, 
   sentiment = "neutral",
   subDetails
}: { 
   title: string; 
   verdict: string; 
   details: string | React.ReactNode; 
   sentiment?: "positive" | "negative" | "warning" | "neutral";
   subDetails?: React.ReactNode;
}) {
   const styles = {
      positive: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/20 text-emerald-800 dark:text-emerald-300",
      negative: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20 text-red-800 dark:text-red-300",
      warning: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/20 text-amber-800 dark:text-amber-300",
      neutral: "bg-muted/50 border-border/60 text-foreground"
   };

   return (
      <div className={`p-4 rounded-xl border ${styles[sentiment]} mb-6 flex items-start gap-3`}>
         <div className="mt-1 shrink-0">
            {sentiment === 'positive' && <CheckCircle2 className="w-5 h-5" />}
            {sentiment === 'negative' && <AlertCircle className="w-5 h-5" />}
            {sentiment === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {sentiment === 'neutral' && <Info className="w-5 h-5" />}
         </div>
         <div className="flex-1">
            <h4 className="font-bold text-sm uppercase tracking-wide opacity-80 mb-1">{title}</h4>
            <div className="font-bold text-lg mb-1">{verdict}</div>
            <div className="text-sm opacity-90 leading-relaxed">{details}</div>
            {subDetails && (
               <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                  {subDetails}
               </div>
            )}
         </div>
      </div>
   );
}

export default function VehicleReport() {
  const [match, params] = useRoute("/report/:id");
  const [location, setLocation] = useLocation();
  const vehicle = getVehicle(params?.id || "");

  // Check URL for mode=offer
  const searchParams = new URLSearchParams(window.location.search);
  const initialMode = searchParams.get('mode') === 'offer';
  const initialTab = searchParams.get('tab') || (initialMode ? 'leverage' : 'summary');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [offerMode, setOfferMode] = useState(initialMode); 
  const { toast } = useToast();

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [match]);

  // Offer Calculator State
  const [negotiationStyle, setNegotiationStyle] = useState<'Conservative' | 'Balanced' | 'Aggressive'>('Balanced');
  const [timeHorizon, setTimeHorizon] = useState<1 | 3 | 5>(3);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [userPrice, setUserPrice] = useState<number | null>(null);

  if (!vehicle) {
    return <Layout><div className="p-8">Vehicle not found</div></Layout>;
  }

  // Calculate Target Offer
  const targetOffer = React.useMemo(() => {
    if (!vehicle) return 0;
    // Aggressive = higher discount (factor 1.2)
    // Conservative = lower discount (factor 0.8)
    const riskFactor = negotiationStyle === 'Aggressive' ? 1.2 : negotiationStyle === 'Balanced' ? 1.0 : 0.8;
    const timeFactor = timeHorizon === 1 ? 0.6 : timeHorizon === 3 ? 1.0 : 1.3;
    
    const effectivePrice = userPrice || vehicle.tco.askingPrice;

    // Simple algo: Ask - (TotalLoss * Factors)
    return Math.floor(effectivePrice - (vehicle.leverageItems.reduce((acc, i) => acc + i.costMin, 0) * riskFactor));
  }, [vehicle, negotiationStyle, timeHorizon, userPrice]);

  // Leverage Logic
  const [selectedLeverageIds, setSelectedLeverageIds] = useState<string[]>(
    vehicle.leverageItems.filter(i => i.id).map(i => i.id) 
  );

  const handleToggleLeverage = (id: string) => {
    if (selectedLeverageIds.includes(id)) {
      setSelectedLeverageIds(selectedLeverageIds.filter(lid => lid !== id));
    } else {
      setSelectedLeverageIds([...selectedLeverageIds, id]);
    }
  };

  const selectedLeverageItems = vehicle.leverageItems.filter(i => selectedLeverageIds.includes(i.id));

  return (
    <Layout>
      <div className="space-y-6 pb-20 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb & Offer Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {!new URLSearchParams(window.location.search).has('view') && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="pl-0 h-auto hover:bg-transparent hover:text-primary" 
                  onClick={() => {
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      setLocation('/compare');
                    }
                  }}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Garage
                </Button>
                <span>/</span>
              </>
            )}
            <span className="font-medium text-foreground">Report</span>
          </div>

           {/* Offer Mode Toggle */}
           <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full border border-border/50">
              <Button 
                variant={offerMode ? "ghost" : "secondary"} 
                size="sm" 
                className="rounded-full h-8 text-xs font-medium"
                onClick={() => setOfferMode(false)}
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Analysis Mode
              </Button>
              <Button 
                variant={offerMode ? "default" : "ghost"} 
                size="sm" 
                className={`rounded-full h-8 text-xs font-medium ${offerMode ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => setOfferMode(true)}
              >
                <HandCoins className="w-3.5 h-3.5 mr-1.5" /> Offer Mode
              </Button>
           </div>
        </div>

        <MissionBriefing 
          page="report"
          title="Vehicle Analysis"
          directive="Review the vehicle's history, value, and future risks to negotiate the best price."
        />

        {/* Offer Mode Calculator Banner */}
        {offerMode && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8 animate-in slide-in-from-top-2">
             <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                   <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                     <Calculator className="w-5 h-5 text-primary" /> Offer Calculator
                   </h2>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Negotiation Style</label>
                        <div className="flex bg-background rounded-md border border-border overflow-hidden">
                          {['Conservative', 'Balanced', 'Aggressive'].map((style) => (
                             <button 
                               key={style}
                               onClick={() => setNegotiationStyle(style as any)}
                               className={`flex-1 text-[10px] py-1.5 ${negotiationStyle === style ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted'}`}
                             >
                               {style}
                             </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Time Horizon</label>
                        <div className="flex bg-background rounded-md border border-border overflow-hidden">
                          {[1, 3, 5].map((y) => (
                             <button 
                               key={y}
                               onClick={() => setTimeHorizon(y as any)}
                               className={`flex-1 text-xs py-1.5 ${timeHorizon === y ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted'}`}
                             >
                               {y} Yr
                             </button>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
                
                <div className="w-px h-16 bg-border/50 hidden md:block" />
                
                <div className="flex gap-6 text-center">
                   <div>
                      <div className="text-sm text-muted-foreground font-medium mb-1">Target Offer</div>
                      <div className="text-3xl font-bold font-mono text-primary">${targetOffer.toLocaleString()}</div>
                   </div>
                   <div>
                      <div className="text-sm text-muted-foreground font-medium mb-1">Walk-Away Price</div>
                      <div className="text-3xl font-bold font-mono text-muted-foreground">${(targetOffer + 1500).toLocaleString()}</div>
                   </div>
                </div>
                
                <div className="w-full md:w-auto">
                   <Button size="lg" className="w-full shadow-md font-bold" onClick={() => {
                      setActiveTab('leverage');
                      setTimeout(() => {
                          const element = document.getElementById('leverage-builder-section');
                          if (element) {
                              const headerOffset = 100;
                              const elementPosition = element.getBoundingClientRect().top;
                              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                              window.scrollTo({
                                  top: offsetPosition,
                                  behavior: "smooth"
                              });
                          }
                      }, 100);
                   }}>
                     Build Strategy
                   </Button>
                </div>
             </div>
          </div>
        )}

        {/* Leverage Builder Drawer */}
        <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
           <DialogContent className="max-w-[95vw] h-[92vh] overflow-hidden flex flex-col p-0">
              <div className="flex-1 overflow-hidden">
                 <LeverageDrawer 
                   isOpen={isDrawerOpen} 
                   onOpenChange={setIsDrawerOpen}
                   leverageItems={vehicle.leverageItems}
                   selectedIds={selectedLeverageIds}
                   onToggle={handleToggleLeverage}
                   onAutoSelect={setSelectedLeverageIds}
                   embedded={true}
                   hideHeader={true}
                   askingPrice={vehicle.tco.askingPrice}
                   fairPrice={vehicle.valuation.privateParty}
                 />
              </div>
           </DialogContent>
        </Dialog>

        {/* Header Section */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white mb-8 shadow-2xl">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
               {vehicle.imageUrl ? (
                 <>
                   <img src={vehicle.imageUrl} alt="Background" className="w-full h-full object-cover opacity-40 blur-xl scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
                 </>
               ) : (
                 <div className="w-full h-full bg-slate-900" />
               )}
            </div>

            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex flex-col md:flex-row gap-6 md:items-center">
                   <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg shrink-0 bg-white/5 relative group">
                      {vehicle.imageUrl ? (
                        <img src={vehicle.imageUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-white/20">
                          <Zap className="w-8 h-8" />
                        </div>
                      )}
                   </div>
                   
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 bg-emerald-500/20 border-emerald-500/50 text-emerald-300 backdrop-blur-md">
                          {vehicle.trim}
                        </Badge>
                        <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Report
                        </span>
                      </div>
                      
                      <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tighter leading-none">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h1>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 font-medium">
                        <span className="flex items-center text-white/90"><Info className="w-4 h-4 mr-2 text-emerald-500" /> {vehicle.mileage.toLocaleString()} miles</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="font-mono text-xs opacity-70">VIN: {vehicle.vin}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span>{vehicle.location}</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="flex-1 md:flex-none h-10 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm font-bold shadow-sm transition-all rounded-lg uppercase tracking-wide text-xs"
                      >
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Share Analysis</DialogTitle>
                        <DialogDescription>
                          Share the full vehicle report with partners or friends.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-4 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                              Link
                            </Label>
                            <Input
                              id="link"
                              defaultValue={window.location.href}
                              readOnly
                              className="h-9"
                            />
                          </div>
                          <Button 
                            type="submit" 
                            size="sm" 
                            className="px-3"
                            onClick={() => {
                              // Simulate shared link by adding view=shared
                              const shareUrl = window.location.href + (window.location.search ? '&' : '?') + 'view=shared';
                              navigator.clipboard.writeText(shareUrl);
                              toast({
                                title: "Link Copied",
                                description: "Share link copied to clipboard.",
                              });
                            }}
                          >
                            <span className="sr-only">Copy</span>
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <Button variant="outline" className="w-full gap-2" onClick={() => {
                                // Simulate shared link
                                const shareUrl = window.location.href + (window.location.search ? '&' : '?') + 'view=shared';
                                toast({
                                    title: "Email Sent",
                                    description: `A secure link has been sent to your email.`,
                                });
                            }}>
                                <Mail className="w-4 h-4" /> Email
                            </Button>
                            <Button variant="outline" className="w-full gap-2" onClick={() => {
                                // Simulate shared link
                                const shareUrl = window.location.href + (window.location.search ? '&' : '?') + 'view=shared';
                                toast({
                                    title: "Message Sent",
                                    description: "Report link sent via SMS.",
                                });
                            }}>
                                <MessageSquare className="w-4 h-4" /> Text
                            </Button>
                        </div>
                        
                        <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground mt-2">
                            <p className="flex items-center gap-2">
                                <Lock className="w-3 h-3" /> 
                                <span>This link provides <strong>read-only access</strong> to this specific vehicle report only. No other garage data is shared.</span>
                            </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex-1 md:flex-none h-10 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm font-bold shadow-sm transition-all rounded-lg uppercase tracking-wide text-xs">
                        <Printer className="w-4 h-4 mr-2" /> PDF
                      </Button>
                    </DialogTrigger>
                    {/* ... Dialog content remains same, handled by Dialog component logic ... */}
                    <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden bg-zinc-900 border-zinc-800">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900 text-white">
                          <div className="flex items-center gap-2">
                            <Printer className="w-5 h-5 text-primary" />
                            <h2 className="font-heading font-bold text-lg">Report Preview</h2>
                          </div>
                          <div className="flex items-center gap-4">
                            <PDFDownloadLink
                              document={<ReportPDF vehicle={vehicle} />}
                              fileName={`${vehicle.year}-${vehicle.make}-${vehicle.model}-Report.pdf`}
                            >
                              {({ loading }) => (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  disabled={loading}
                                  className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                >
                                  {loading ? 'Preparing...' : 'Download PDF'}
                                </Button>
                              )}
                            </PDFDownloadLink>
                          </div>
                        </div>
                        <div className="flex-1 bg-zinc-900 relative">
                           <PDFViewer className="w-full h-full border-0" showToolbar={true}>
                              <ReportPDF vehicle={vehicle} />
                           </PDFViewer>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    className="flex-1 md:flex-none h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all rounded-lg uppercase tracking-wide text-xs border-0" 
                    onClick={() => {
                        setActiveTab('leverage');
                        setTimeout(() => {
                            const element = document.getElementById('leverage-builder-section');
                            if (element) {
                                const headerOffset = 100;
                                const elementPosition = element.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: "smooth"
                                });
                            }
                        }, 100);
                    }}
                  >
                    <HandCoins className="w-4 h-4 mr-2" /> Negotiate ({selectedLeverageIds.length})
                  </Button>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="summary" value={activeTab} className="space-y-8" onValueChange={setActiveTab}>
          <div className="sticky top-14 z-40 bg-background/95 backdrop-blur py-2 border-b border-border/40 -mx-4 px-4 md:mx-0 md:px-0 flex md:justify-center">
            <TabsList className="bg-transparent p-0 h-auto w-full overflow-x-auto no-scrollbar justify-start md:justify-center rounded-none border-b border-border/10 space-x-6">
              <TabsTrigger 
                value="summary" 
                className="px-1 pb-3 pt-2 h-auto rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger 
                value="valuation" 
                className="px-1 pb-3 pt-2 h-auto rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Market Valuation
              </TabsTrigger>
              <TabsTrigger 
                value="repairs" 
                className="px-1 pb-3 pt-2 h-auto rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Projected Future Repairs
              </TabsTrigger>
              <TabsTrigger 
                value="maintenance" 
                className="px-1 pb-3 pt-2 h-auto rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Maintenance & Due Now
              </TabsTrigger>
              <TabsTrigger 
                value="leverage" 
                className="px-1 pb-3 pt-2 h-auto rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Leverage Builder
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="px-1 pb-3 pt-2 h-auto rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Vehicle History
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 1. SUMMARY TAB */}
          <TabsContent value="summary" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             
             {/* Executive Summary Card */}
             <Card className="border border-border/60 bg-gradient-to-br from-white to-slate-50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
               <CardContent className="p-8 relative z-10">
                 
                 {/* Purchase Price Input */}
                 <div className="mb-6 p-4 bg-background/50 border border-border/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground block mb-0.5">Purchase Price / Offer</label>
                            <div className="text-sm text-muted-foreground">Adjust to see how it affects your deal rating.</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-muted-foreground">$</span>
                        <Input 
                            type="number" 
                            className="w-32 font-mono font-bold text-lg h-10 bg-white" 
                            value={userPrice || vehicle.tco.askingPrice}
                            onChange={(e) => setUserPrice(Number(e.target.value))}
                        />
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                    <div className="flex-1 space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="bg-primary/10 p-2 rounded-lg">
                           <Sparkles className="w-5 h-5 text-primary" />
                         </div>
                         <h3 className="text-lg font-heading font-bold text-foreground">
                           Executive Summary
                         </h3>
                       </div>
                       <p className="text-foreground/90 leading-relaxed text-lg font-medium">
                         {vehicle.expertAnalysis.overallEvaluation}
                       </p>
                       
                       {/* NEW: Mini Market Roll-up */}
                       <div className="flex flex-wrap gap-4 pt-2">
                          <div className="bg-white/50 border border-border/50 rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm">
                             <DollarSign className="w-4 h-4 text-emerald-600" />
                             <span className="text-muted-foreground">
                               <GlossaryTooltip term="Fair Price Range" className="border-b-0">Fair Price Range:</GlossaryTooltip>
                             </span>
                             <span className="font-bold font-mono text-foreground">${(vehicle.valuation.privateParty * 0.95).toLocaleString()} - ${(vehicle.valuation.privateParty * 1.05).toLocaleString()}</span>
                          </div>
                          <div className="bg-white/50 border border-border/50 rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm">
                             <TrendingDown className="w-4 h-4 text-emerald-600" />
                             <span className="text-muted-foreground">
                               <GlossaryTooltip term="3-Year Low" definition="The lowest projected value of this car over the next 3 years based on depreciation curves." className="border-b-0">3-Year Low:</GlossaryTooltip>
                             </span>
                             <span className="font-bold font-mono text-foreground">${(vehicle.valuation.tradeIn * 0.9).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 shrink-0 w-full md:w-auto">
                       <div className="text-center p-4 bg-white rounded-xl border shadow-sm min-w-[120px]">
                          <div className="text-4xl font-black text-foreground tracking-tight">{vehicle.scores.dealScore}</div>
                          <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-2">
                            <GlossaryTooltip term="Deal Score" className="border-b-0 gap-1 hover:text-primary transition-colors justify-center">Deal Score</GlossaryTooltip>
                          </div>
                       </div>
                       
                       <Button 
                         className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md h-10"
                         onClick={() => setActiveTab('leverage')}
                       >
                         <ShieldAlert className="w-4 h-4 mr-2" /> Leverage Builder
                       </Button>
                    </div>
                 </div>

                 <Separator className="my-6 bg-border/40" />

                 {/* NEW: Critical Stats Strip */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Market Status */}
                    <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                       <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                         <GlossaryTooltip term="Market Status" className="border-b-0">Market Status</GlossaryTooltip>
                       </div>
                       <div className={`font-bold ${(userPrice || vehicle.tco.askingPrice) > vehicle.valuation.privateParty ? 'text-red-600' : 'text-emerald-600'}`}>
                          {(userPrice || vehicle.tco.askingPrice) > vehicle.valuation.privateParty ? 'Overpriced' : 'Fairly Priced'}
                       </div>
                       <div className="text-xs text-muted-foreground">
                          Offer is <span className="font-mono font-medium">${Math.abs((userPrice || vehicle.tco.askingPrice) - vehicle.valuation.privateParty).toLocaleString()}</span> {(userPrice || vehicle.tco.askingPrice) > vehicle.valuation.privateParty ? 'over' : 'under'} fair value
                       </div>
                    </div>

                    {/* 2. Issue Severity */}
                    <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                       <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                         <GlossaryTooltip term="Risk Severity" className="border-b-0">Risk Severity</GlossaryTooltip>
                       </div>
                       <div className="flex h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1 mb-1">
                          <div className="bg-red-500 w-[20%]" />
                          <div className="bg-amber-400 w-[30%]" />
                          <div className="bg-emerald-400 w-[50%]" />
                       </div>
                       <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                          <span className="text-red-600">2 Critical</span>
                          <span className="text-amber-600">3 Moderate</span>
                          <span className="text-emerald-600">5 Low</span>
                       </div>
                    </div>

                    {/* 3. Maint Gaps */}
                    <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                       <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                         <GlossaryTooltip term="Service Gaps" className="border-b-0">Service Gaps</GlossaryTooltip>
                       </div>
                       <div className="font-bold text-amber-600 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> 2 Detected
                       </div>
                       <div className="text-xs text-muted-foreground">
                          Est. deferred cost: <span className="font-mono font-bold text-foreground">~$2,400</span>
                       </div>
                    </div>

                    {/* 4. Recalls */}
                    <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                       <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                         <GlossaryTooltip term="Safety Recalls" className="border-b-0">Safety Recalls</GlossaryTooltip>
                       </div>
                       <div className="font-bold text-red-600 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4" /> Open Recall
                       </div>
                       <Button variant="link" className="h-auto p-0 text-[10px] text-primary justify-start" onClick={() => setActiveTab('repairs')}>
                          Validate Completion <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                       </Button>
                    </div>
                 </div>
               </CardContent>
             </Card>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card>
                 <CardHeader>
                   <CardTitle>Total Cost of Ownership</CardTitle>
                   <CardDescription>Breakdown of estimated costs over 3 years</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <TcoBreakdownChart 
                      costs={[
                        { name: "Depreciation", value: vehicle.tco.depreciationLoss },
                        { name: "Maintenance", value: vehicle.tco.routineMaintenanceCost },
                        { name: "Service Gaps", value: vehicle.tco.immediateCostBurden },
                        { name: "Risk/Repairs", value: vehicle.tco.expectedUnscheduledRepairCost }
                      ]} 
                    />
                 </CardContent>
               </Card>
               
               <Card>
                 <CardHeader>
                   <CardTitle>Cost Timeline</CardTitle>
                   <CardDescription>Cumulative ownership cost over time</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <CumulativeCostChart vehicle={vehicle} />
                 </CardContent>
               </Card>
             </div>

             {/* Vehicle History Summary Chart */}
             <HistoryTimeline records={vehicle.serviceRecords} />
          </TabsContent>

          {/* 2. MARKET VALUATION TAB */}
          <TabsContent value="valuation" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             
             <QuickSummary 
               title="Valuation Analysis"
               verdict={vehicle.tco.askingPrice > vehicle.valuation.privateParty ? "Currently Overpriced" : "Fairly Priced"}
               details={`The asking price of $${vehicle.tco.askingPrice.toLocaleString()} is $${Math.abs(vehicle.tco.askingPrice - vehicle.valuation.privateParty).toLocaleString()} ${vehicle.tco.askingPrice > vehicle.valuation.privateParty ? 'above' : 'below'} the fair private party market value. You have room to negotiate.`}
               sentiment={vehicle.tco.askingPrice > vehicle.valuation.privateParty ? "warning" : "positive"}
             />

             {/* Market Valuation Roll-up Strip */}
             <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 bg-background border border-border/60 rounded-xl p-4 flex items-center justify-between shadow-sm">
                   <div>
                      <GlossaryTooltip 
                        term="Fair Price Range" 
                        definition="Estimated fair private-party price range for this vehicle given mileage/market comps. Use it to sanity-check the asking price. It’s an estimate, not a guarantee."
                        className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 border-none"
                      />
                      <div className="text-lg font-mono font-bold text-foreground">
                         ${(vehicle.valuation.privateParty * 0.95).toLocaleString()} - ${(vehicle.valuation.privateParty * 1.05).toLocaleString()}
                      </div>
                   </div>
                   <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                      <DollarSign className="w-4 h-4" />
                   </div>
                </div>
                <div className="flex-1 bg-background border border-border/60 rounded-xl p-4 flex items-center justify-between shadow-sm">
                   <div>
                      <GlossaryTooltip 
                        term="3-Year Low" 
                        definition="Historical low estimate over the last ~3 years for similar listings. Useful as a negotiation anchor, not a promise."
                        className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 border-none"
                      />
                      <div className="text-lg font-mono font-bold text-foreground">
                         ${(vehicle.valuation.tradeIn * 0.9).toLocaleString()}
                      </div>
                   </div>
                   <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                      <TrendingDown className="w-4 h-4" />
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Retail Value Card */}
                <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background p-6 shadow-sm group hover:shadow-md transition-all">
                   <div className="absolute top-0 right-0 p-16 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                   <div className="relative z-10">
                      <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <GlossaryTooltip term="Retail Value" definition="Typical dealer list price." className="border-none" />
                      </div>
                      <div className="text-4xl font-black text-foreground font-mono tracking-tight mb-2">
                        ${vehicle.valuation.retail.toLocaleString()}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground bg-emerald-100/50 dark:bg-emerald-900/20 px-2 py-1 rounded inline-block">
                        Range: ${(vehicle.valuation.retailRange[0]/1000).toFixed(1)}k - ${(vehicle.valuation.retailRange[1]/1000).toFixed(1)}k
                      </div>
                   </div>
                </div>

                {/* Private Party Card */}
                <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background p-6 shadow-sm group hover:shadow-md transition-all">
                   <div className="relative z-10">
                      <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                         <GlossaryTooltip term="Private Party" definition="Typical direct-to-seller price." className="border-none" />
                      </div>
                      <div className="text-4xl font-black text-foreground font-mono tracking-tight mb-2">
                        ${vehicle.valuation.privateParty.toLocaleString()}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground bg-blue-100/50 dark:bg-blue-900/20 px-2 py-1 rounded inline-block">
                        Range: ${(vehicle.valuation.privateRange[0]/1000).toFixed(1)}k - ${(vehicle.valuation.privateRange[1]/1000).toFixed(1)}k
                      </div>
                   </div>
                </div>

                {/* Trade-In Value Card */}
                <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background p-6 shadow-sm group hover:shadow-md transition-all">
                   <div className="relative z-10">
                      <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1 flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                         <GlossaryTooltip term="Trade-In Value" definition="What a dealer may offer you if you trade it in." className="border-none" />
                      </div>
                      <div className="text-4xl font-black text-foreground font-mono tracking-tight mb-2">
                        ${vehicle.valuation.tradeIn.toLocaleString()}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground bg-amber-100/50 dark:bg-amber-900/20 px-2 py-1 rounded inline-block">
                        Range: ${(vehicle.valuation.tradeRange[0]/1000).toFixed(1)}k - ${(vehicle.valuation.tradeRange[1]/1000).toFixed(1)}k
                      </div>
                   </div>
                </div>
             </div>
             
             <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GlossaryTooltip 
                      term="Projected Depreciation" 
                      definition="This shows estimated resale value over time. ‘You are here’ is current mileage. The red dot is your ownership horizon (3 yrs @ 12k/yr)."
                      className="border-none text-xl font-heading font-bold"
                    />
                  </CardTitle>
                  <CardDescription>Projected value loss over the next 5 years</CardDescription>
                </CardHeader>
                <CardContent>
                  <DepreciationChart 
                    data={vehicle.valuation.depreciationCurve} 
                    currentMileage={vehicle.mileage} 
                    ownershipYears={timeHorizon}
                    annualMileage={12000}
                  />
                  
                  <div className="text-xs text-center text-muted-foreground mt-4 mb-4 font-medium bg-muted/30 py-2 rounded">
                    How to read: Steeper drop = faster value loss. Compare where you land at the horizon.
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 pt-2">
                     <Button 
                       variant="outline" 
                       className="border-primary/20 hover:bg-primary/5 font-bold"
                       onClick={() => setActiveTab('summary')}
                     >
                       See Total Ownership Cost <ChevronRight className="w-4 h-4 ml-2" />
                     </Button>
                     <Button 
                       className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                       onClick={() => {
                          handleToggleLeverage('price-negotiation'); // Assuming a generic ID for price leverage, or we add one
                          setActiveTab('leverage');
                       }}
                     >
                       Use in Leverage Builder <ShieldAlert className="w-4 h-4 ml-2" />
                     </Button>
                  </div>
                </CardContent>
             </Card>
          </TabsContent>

          {/* 3. PROJECTED FUTURE REPAIRS TAB */}
          <TabsContent value="repairs" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             
             <QuickSummary 
               title="Risk Forecast"
               verdict={`${vehicle.risks.filter(r => r.riskLevel === 'High').length} High Probability Failures Detected`}
               details={`Based on mileage trends for this model, you are entering a high-risk window for ${vehicle.risks.find(r => r.riskLevel === 'High')?.name || 'major components'}. Total projected exposure is $${vehicle.tco.expectedUnscheduledRepairCost.toLocaleString()}.`}
               sentiment="warning"
               subDetails={
                  <div>
                     <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Why we think this is high risk:</div>
                     <ul className="space-y-1">
                        <li className="text-sm font-medium flex items-center gap-2 hover:underline cursor-pointer">
                           <AlertTriangle className="w-3.5 h-3.5" /> Service gap 2019–2022
                        </li>
                        <li className="text-sm font-medium flex items-center gap-2 hover:underline cursor-pointer">
                           <Info className="w-3.5 h-3.5" /> Repeated "visual inspection only" notes
                        </li>
                        <li className="text-sm font-medium flex items-center gap-2 hover:underline cursor-pointer">
                           <XCircle className="w-3.5 h-3.5" /> No record of Water Pump replacement by 72k miles
                        </li>
                     </ul>
                  </div>
               }
             />

             <RecallValidationCard recalls={vehicle.recalls || []} vin={vehicle.vin} />

             <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle>Risk Urgency Map</CardTitle>
                  <CardDescription>Visualizing probability vs cost impact of potential failures</CardDescription>
                </CardHeader>
                <CardContent>
                   <RiskUrgencyMap risks={vehicle.risks} />
                </CardContent>
             </Card>

             <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-xl opacity-30 pointer-events-none" />
                <SurvivabilityChart currentMileage={vehicle.mileage} items={vehicle.unscheduledForecast} />
             </div>
          </TabsContent>

          {/* 4. MAINTENANCE & DUE NOW TAB */}
          <TabsContent value="maintenance" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             
             {/* 1. Urgency Cards Stack */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Maintenance Urgency
                    </h3>
                    <div className="text-xs text-muted-foreground">
                        Sorted by priority based on service history gaps
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* RED: Past Due */}
                    {(() => {
                        const overdue = vehicle.gapAnalysis.items.filter(i => i.status === 'overdue' || i.status === 'dueNow');
                        return overdue.map(item => (
                            <div key={item.id} className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none" />
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <Badge variant="destructive" className="font-bold uppercase text-[10px] tracking-wide">Past Due</Badge>
                                    <div className="text-xs font-mono font-bold text-red-700 dark:text-red-400">
                                        ${item.costRange[0]} - ${item.costRange[1]}
                                    </div>
                                </div>
                                <h4 className="font-bold text-foreground mb-1 relative z-10">{item.item}</h4>
                                <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-3 relative z-10">
                                    Overdue by {(vehicle.mileage - (item.lastDoneMiles || 0)).toLocaleString()} miles
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full h-8 text-xs border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800 bg-white/50"
                                    onClick={() => handleToggleLeverage(item.id)}
                                >
                                    {selectedLeverageIds.includes(item.id) ? (
                                        <><Check className="w-3 h-3 mr-1" /> Added to Plan</>
                                    ) : (
                                        <><ShieldAlert className="w-3 h-3 mr-1" /> Add to Leverage</>
                                    )}
                                </Button>
                            </div>
                        ));
                    })()}

                    {/* YELLOW: Due Soon */}
                    {(() => {
                        const dueSoon = vehicle.gapAnalysis.items.filter(i => i.status === 'dueSoon');
                        return dueSoon.map(item => (
                            <div key={item.id} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none" />
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 font-bold uppercase text-[10px] tracking-wide">Due Soon</Badge>
                                    <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                                        ${item.costRange[0]} - ${item.costRange[1]}
                                    </div>
                                </div>
                                <h4 className="font-bold text-foreground mb-1 relative z-10">{item.item}</h4>
                                <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-3 relative z-10">
                                    Due in {((item.lastDoneMiles || 0) + 10000 - vehicle.mileage).toLocaleString()} miles
                                </div>
                                <div className="text-xs text-muted-foreground bg-white/50 p-1.5 rounded relative z-10">
                                    Plan budget for next service visit.
                                </div>
                            </div>
                        ));
                    })()}

                    {/* GREEN: Later (Dynamic) */}
                    {(() => {
                        // Find items that are NOT in the overdue/dueSoon list to show as "Later"
                        const problematicIds = vehicle.gapAnalysis.items.map(i => i.item); // Using name for matching since IDs might differ
                        const upcomingItems = vehicle.routineMaintenanceSchedule.filter(
                            item => !problematicIds.some(prob => prob.includes(item.item) || item.item.includes(prob))
                        ).slice(0, 1); // Just show one example

                        return upcomingItems.map(item => (
                            <div key={item.id} className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-4 shadow-sm relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-100/50 font-bold uppercase text-[10px] tracking-wide">Later</Badge>
                                    <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                        ${item.costRange[0]} - ${item.costRange[1]}
                                    </div>
                                </div>
                                <h4 className="font-bold text-foreground mb-1">{item.item}</h4>
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-3">
                                    Due at {(item.intervalMiles + 60000).toLocaleString()} miles
                                </div>
                                <div className="text-xs text-muted-foreground bg-white/50 p-1.5 rounded">
                                    {((item.intervalMiles + 60000) - vehicle.mileage).toLocaleString()} miles remaining. No action needed.
                                </div>
                            </div>
                        ));
                    })()}
                </div>
             </div>

             <Separator />

             {/* 2. Gap Analysis Grid (Replaces Table) */}
             <Card>
               <CardHeader>
                 <CardTitle>Maintenance Gap Analysis</CardTitle>
                 <CardDescription>
                    Visual comparison of usage vs. interval. <span className="text-emerald-600 font-medium">Green bar</span> = Life remaining. <span className="text-red-600 font-medium">Red bar</span> = Overdue.
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {vehicle.routineMaintenanceSchedule.map((item) => {
                        // Mock Gap Logic
                        let lastDone = "Unknown";
                        let status: 'Overdue' | 'Due Soon' | 'Good' = 'Good';
                        let percentage = 0;
                        let lastDoneMiles = 0;
                        
                        // Mocking logic for visuals
                        if (item.item.includes("Oil")) {
                            lastDone = "62,300 mi";
                            lastDoneMiles = 62300;
                            status = 'Overdue';
                            percentage = 110; // Overdue
                        } else if (item.item.includes("Filter")) {
                            lastDone = "62,300 mi";
                            lastDoneMiles = 62300;
                            status = 'Due Soon';
                            percentage = 90;
                        } else if (item.item.includes("Belt")) {
                             lastDone = "Original";
                             lastDoneMiles = 0;
                             status = 'Overdue';
                             percentage = 120;
                        } else {
                            lastDone = "60k Svc";
                            lastDoneMiles = 60000;
                            status = 'Good';
                            percentage = ((vehicle.mileage - lastDoneMiles) / item.intervalMiles) * 100;
                        }

                        // Cap percentage for bar visual
                        const barWidth = Math.min(percentage, 100);
                        const isOverdue = percentage > 100;

                        return (
                           <div key={item.id} className="border border-border/60 rounded-xl p-4 bg-background hover:shadow-sm transition-all flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
                                            {item.item}
                                        </div>
                                        <div className="text-sm font-medium">
                                            Last: {lastDone}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                         <Badge variant={status === 'Overdue' ? 'destructive' : (status === 'Due Soon' ? 'secondary' : 'outline')} className="font-bold text-[10px] uppercase">
                                            {status}
                                         </Badge>
                                         <div className="text-xs font-mono text-muted-foreground mt-1">
                                            ${item.costRange[0]}-${item.costRange[1]}
                                         </div>
                                    </div>
                                </div>

                                {/* Progress Bar Visual */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                        <span>Usage</span>
                                        <span>{isOverdue ? 'Overdue' : `${Math.round(100 - percentage)}% Rem.`}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${status === 'Overdue' ? 'bg-red-500' : (status === 'Due Soon' ? 'bg-amber-400' : 'bg-emerald-500')}`}
                                            style={{ width: `${barWidth}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>0%</span>
                                        <span>Interval: {item.intervalMiles.toLocaleString()} mi</span>
                                    </div>
                                </div>
                           </div>
                        );
                     })}
                 </div>
               </CardContent>
             </Card>

          </TabsContent>

          {/* 6. LEVERAGE BUILDER TAB */}
          <TabsContent id="leverage-builder-section" value="leverage" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <LeverageDrawer 
               isOpen={true} 
               onOpenChange={() => {}} 
               leverageItems={vehicle.leverageItems}
               selectedIds={selectedLeverageIds}
               onToggle={handleToggleLeverage}
               onAutoSelect={setSelectedLeverageIds}
               embedded={true}
               hideHeader={false}
               askingPrice={vehicle.tco.askingPrice}
               fairPrice={vehicle.valuation.privateParty}
               negotiationStyle={negotiationStyle}
               targetOffer={targetOffer}
             />
          </TabsContent>

             {/* 7. VEHICLE HISTORY TAB */}
          <TabsContent value="history" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             
             {/* The Requested Chart */}
             <HistoryTimeline records={vehicle.serviceRecords} />

             <Card>
               <CardHeader>
                 <CardTitle>Vehicle Timeline</CardTitle>
                 <CardDescription>Detailed service and ownership history</CardDescription>
               </CardHeader>
               <CardContent>
                 {/* Ownership & Context Block */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                       <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Ownership Context</div>
                       <div className="text-sm font-medium">Registered in: <span className="font-bold text-foreground">Ohio</span></div>
                       <div className="text-sm font-medium text-amber-600 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" /> Inconsistent Usage
                       </div>
                       <div className="text-xs text-muted-foreground mt-1">Long gaps between 2019-2022</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                       <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Mileage Consistency</div>
                       <div className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Logical Progression
                       </div>
                       <div className="text-xs text-muted-foreground mt-1">No rollbacks detected</div>
                    </div>
                 </div>

                 {/* Narrative Block */}
                 <div className="bg-muted/30 p-4 rounded-lg mb-2 border border-border/50">
                    <h4 className="font-bold flex items-center gap-2 mb-2">
                       <History className="w-4 h-4 text-primary" /> History Narrative
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       This vehicle shows a generally consistent service history in the {vehicle.location} area. 
                       Early ownership years show regular dealer servicing, but a transition to independent shops occurred around 50,000 miles.
                       The gap in service records between 2019 and 2022 is the most significant anomaly, suggesting a period of low usage or undocumented maintenance.
                    </p>
                 </div>

                 {/* Gaps Summary Section */}
                 <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg mb-6 border border-amber-200 dark:border-amber-900/20">
                    <div className="flex items-start justify-between gap-4">
                       <div className="space-y-3">
                          <h4 className="font-bold text-amber-800 dark:text-amber-500 text-sm uppercase tracking-wide flex items-center gap-2">
                             <AlertTriangle className="w-4 h-4" /> Known Gaps & Anomalies Summary
                          </h4>
                          
                          <div className="grid gap-3">
                             <div className="pl-4 border-l-2 border-amber-300 dark:border-amber-700">
                                <div className="font-bold text-sm text-foreground">2019–2022 Missing Service History (28 months)</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                   <span className="font-bold text-amber-700 dark:text-amber-500">Confidence Impact:</span> Reduces confidence in maintenance cadence significantly.
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                   <span className="font-bold text-amber-700 dark:text-amber-500">Likely Interpretation:</span> Maintenance likely deferred during low-usage period, or done by owner without documentation.
                                </div>
                             </div>

                             <div className="pl-4 border-l-2 border-amber-300 dark:border-amber-700">
                                <div className="font-bold text-sm text-foreground">Repeated "Visual Inspection Only" Notes</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                   <span className="font-bold text-amber-700 dark:text-amber-500">Confidence Impact:</span> Suggests "bare minimum" approach to care.
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                   <span className="font-bold text-amber-700 dark:text-amber-500">Likely Interpretation:</span> Owner declined recommended repairs multiple times.
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-col gap-2 shrink-0">
                          <Button 
                             size="sm" 
                             variant="outline" 
                             className="h-8 text-xs bg-white hover:bg-amber-100 text-amber-800 border-amber-200 shadow-sm"
                             onClick={() => {
                                handleToggleLeverage('service-gap-2019'); // Mock ID
                                toast({ description: "Added Service Gap to Leverage Builder" });
                             }}
                          >
                             <ShieldAlert className="w-3 h-3 mr-1.5" /> Use Gap as Leverage
                          </Button>
                          <Button 
                             size="sm" 
                             variant="outline" 
                             className="h-8 text-xs bg-white hover:bg-amber-100 text-amber-800 border-amber-200 shadow-sm"
                             onClick={() => {
                                handleToggleLeverage('visual-inspection-notes'); // Mock ID
                                toast({ description: "Added Inspection Notes to Leverage Builder" });
                             }}
                          >
                             <ShieldAlert className="w-3 h-3 mr-1.5" /> Use Notes as Leverage
                          </Button>
                       </div>
                    </div>
                 </div>

                 {/* Anomalies & Signals Section */}
                 <div className="mb-6">
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-3 text-muted-foreground">Anomalies & Signals</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                       <div className="border border-border/60 bg-background p-3 rounded-lg flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                          <div>
                             <div className="text-sm font-bold">Inspection-Only Pattern</div>
                             <div className="text-xs text-muted-foreground mt-1">3 consecutive visits with no work performed.</div>
                          </div>
                       </div>
                       <div className="border border-border/60 bg-background p-3 rounded-lg flex items-start gap-3">
                          <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                             <div className="text-sm font-bold">Mileage Reporting</div>
                             <div className="text-xs text-muted-foreground mt-1">Missing in 2 entries (2020, 2021).</div>
                          </div>
                       </div>
                       <div className="border border-border/60 bg-background p-3 rounded-lg flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                          <div>
                             <div className="text-sm font-bold">Title Clean</div>
                             <div className="text-xs text-muted-foreground mt-1">No salvage, flood, or rebuild brands.</div>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <EvidenceTable data={vehicle.serviceRecords} />
               </CardContent>
             </Card>
          </TabsContent>

        </Tabs>

        {/* Drawer for Script */}
        <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
           <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
              <div className="p-6 pb-0 flex-shrink-0">
                 <DialogHeader>
                    <DialogTitle className="font-heading text-2xl">Negotiation Strategy</DialogTitle>
                    <DialogDescription>
                       Use these points to justify your offer of <span className="font-bold text-foreground">${targetOffer.toLocaleString()}</span>.
                    </DialogDescription>
                 </DialogHeader>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                 <LeverageDrawer 
                   isOpen={isDrawerOpen} 
                   onOpenChange={setIsDrawerOpen}
                   leverageItems={vehicle.leverageItems}
                   selectedIds={selectedLeverageIds}
                   onToggle={handleToggleLeverage}
                   onAutoSelect={setSelectedLeverageIds}
                   embedded={true}
                   hideHeader={true}
                   askingPrice={vehicle.tco.askingPrice}
                   fairPrice={vehicle.valuation.privateParty}
                   negotiationStyle={negotiationStyle}
                   targetOffer={targetOffer}
                 />
              </div>
           </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
