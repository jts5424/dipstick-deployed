import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRoute, useLocation } from "wouter";
import Layout from "@/components/Layout";
import MissionBriefing from "@/components/MissionBriefing";
import { getPortfolio, analyzeServiceHistory, getRoutineMaintenance, getUnscheduledMaintenance, performGapAnalysis, evaluateUnscheduledMaintenanceRisk, getMarketValuation, savePortfolio } from "@/lib/api";
import { portfolioToVehicle } from "@/lib/portfolioTransform";
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
import MaintenanceCostChart from "@/components/MaintenanceCostChart";
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
  const [vehicle, setVehicle] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check URL for mode=offer and runAnalysis
  const searchParams = new URLSearchParams(window.location.search);
  const initialMode = searchParams.get('mode') === 'offer';
  const initialTab = searchParams.get('tab') || (initialMode ? 'leverage' : 'summary');
  const shouldRunAnalysis = searchParams.get('runAnalysis') === 'true';

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [offerMode, setOfferMode] = useState(initialMode); 
  const { toast } = useToast();
  
  // Analysis workflow state
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{
    serviceHistory: boolean;
    routineMaintenance: boolean;
    unscheduledMaintenance: boolean;
    gapAnalysis: boolean;
    riskEvaluation: boolean;
    marketValuation: boolean;
  }>({
    serviceHistory: false,
    routineMaintenance: false,
    unscheduledMaintenance: false,
    gapAnalysis: false,
    riskEvaluation: false,
    marketValuation: false,
  });

  // Offer Calculator State
  const [negotiationStyle, setNegotiationStyle] = useState<'Conservative' | 'Balanced' | 'Aggressive'>('Balanced');
  const [timeHorizon, setTimeHorizon] = useState<1 | 3 | 5>(3);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [userPrice, setUserPrice] = useState<number | null>(null);

  // Leverage Logic - must be before early returns
  const [selectedLeverageIds, setSelectedLeverageIds] = useState<string[]>([]);

  // Calculate Target Offer - must be before early returns
  const targetOffer = React.useMemo(() => {
    if (!vehicle) return 0;
    // Aggressive = higher discount (factor 1.2)
    // Conservative = lower discount (factor 0.8)
    const riskFactor = negotiationStyle === 'Aggressive' ? 1.2 : negotiationStyle === 'Balanced' ? 1.0 : 0.8;
    const timeFactor = timeHorizon === 1 ? 0.6 : timeHorizon === 3 ? 1.0 : 1.3;
    
    const effectivePrice = userPrice || vehicle.tco?.askingPrice || 0;

    // Simple algo: Ask - (TotalLoss * Factors)
    const leverageItems = vehicle.leverageItems || [];
    return Math.floor(effectivePrice - (leverageItems.reduce((acc: number, i: { costMin?: number }) => acc + (i.costMin || 0), 0) * riskFactor));
  }, [vehicle, negotiationStyle, timeHorizon, userPrice]);

  // Load portfolio data from API
  React.useEffect(() => {
    const loadPortfolio = async () => {
      if (!params?.id) return;
      
      try {
        setIsLoading(true);
        const result = await getPortfolio(params.id);
        
        if (result.portfolio) {
          setPortfolio(result.portfolio);
          // Transform portfolio to vehicle format for compatibility
          const transformedVehicle = portfolioToVehicle(result.portfolio);
          setVehicle(transformedVehicle);
          // Update leverage IDs when vehicle loads
          const leverageIds = (transformedVehicle.leverageItems || []).filter((i: any) => i.id).map((i: any) => i.id);
          setSelectedLeverageIds(leverageIds);
        } else {
          toast({
            title: "Vehicle Not Found",
            description: "Could not find vehicle data.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading portfolio:', error);
        toast({
          title: "Error Loading Vehicle",
          description: "Failed to load vehicle data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
    window.scrollTo(0, 0);
  }, [params?.id, toast]);

  // Run analysis workflow if requested
  React.useEffect(() => {
    const runAnalysisWorkflow = async () => {
      if (!shouldRunAnalysis || !portfolio || !vehicle || isRunningAnalysis || !params?.id) return;
      
      const vehicleData = portfolio.vehicleData;
      const serviceHistory = portfolio.parsedServiceHistory;

      if (!serviceHistory) {
        toast({
          title: "No Service History",
          description: "Please upload and parse a PDF first.",
          variant: "destructive"
        });
        window.history.replaceState({}, '', `/report/${params.id}`);
        return;
      }

      setIsRunningAnalysis(true);
      toast({
        title: "Starting Analysis",
        description: "Running full analysis workflow...",
      });

      // Build up portfolio data incrementally
      let updatedPortfolio = { ...portfolio };
      
      if (!params?.id) {
        throw new Error('Portfolio ID is missing');
      }
      
      // Helper function to save portfolio with merged data
      const savePortfolioWithMerge = async (newData: Partial<any>) => {
        // Fetch current portfolio to preserve existing data
        const currentResult = await getPortfolio(params.id);
        const currentPortfolio = currentResult.portfolio || portfolio;
        
        // Merge existing data with new data
        const mergedData = {
          portfolioId: params.id,
          vehicleData: newData.vehicleData || currentPortfolio.vehicleData || vehicleData,
          parsedServiceHistory: newData.parsedServiceHistory !== undefined ? newData.parsedServiceHistory : ((currentPortfolio as any).parsedServiceHistory || serviceHistory),
          serviceHistoryAnalysis: newData.serviceHistoryAnalysis !== undefined ? newData.serviceHistoryAnalysis : (currentPortfolio as any).serviceHistoryAnalysis,
          routineMaintenance: newData.routineMaintenance !== undefined ? newData.routineMaintenance : currentPortfolio.routineMaintenance,
          unscheduledMaintenance: newData.unscheduledMaintenance !== undefined ? newData.unscheduledMaintenance : currentPortfolio.unscheduledMaintenance,
          gapAnalysis: newData.gapAnalysis !== undefined ? newData.gapAnalysis : currentPortfolio.gapAnalysis,
          riskEvaluation: newData.riskEvaluation !== undefined ? newData.riskEvaluation : currentPortfolio.riskEvaluation,
          marketValuation: newData.marketValuation !== undefined ? newData.marketValuation : currentPortfolio.marketValuation
        };
        
        await savePortfolio(mergedData as any);
        return mergedData;
      };
      
      try {
        // Check if service history analysis already exists (from parsing)
        let serviceHistoryAnalysis = portfolio.serviceHistoryAnalysis || (portfolio as any).serviceHistoryAnalysis;
        if (!serviceHistoryAnalysis) {
          // Only run if it doesn't exist
          setAnalysisProgress(prev => ({ ...prev, serviceHistory: true }));
          console.log('[Report] 📊 Analyzing service history (not found in database)...');
          const analysisResult = await analyzeServiceHistory(vehicleData, serviceHistory);
          if (!analysisResult || !analysisResult.analysis) {
            throw new Error('Service history analysis failed');
          }
          serviceHistoryAnalysis = analysisResult.analysis;
          // Save to database
          const savedData0 = await savePortfolioWithMerge({
            serviceHistoryAnalysis: serviceHistoryAnalysis
          });
          updatedPortfolio = { ...updatedPortfolio, ...savedData0 };
          setPortfolio(updatedPortfolio);
          const transformedVehicle0 = portfolioToVehicle(updatedPortfolio);
          setVehicle(transformedVehicle0);
          setAnalysisProgress(prev => ({ ...prev, serviceHistory: false }));
        } else {
          console.log('[Report] ✅ Service history analysis already exists, skipping...');
        }
        
        // Step 1: Get routine maintenance schedule
        setAnalysisProgress(prev => ({ ...prev, routineMaintenance: true }));
        console.log('[Report] 📊 STEP 1: Getting routine maintenance schedule...');
        const routineResult = await getRoutineMaintenance(vehicleData);
        console.log('[Report] ✅ STEP 1: Routine maintenance result:', routineResult);
        // Save to database immediately with merged data
        const savedData1 = await savePortfolioWithMerge({
          routineMaintenance: routineResult.routineMaintenance || routineResult.schedule || routineResult
        });
        updatedPortfolio = { ...updatedPortfolio, ...savedData1 };
        setPortfolio(updatedPortfolio);
        const transformedVehicle1 = portfolioToVehicle(updatedPortfolio);
        setVehicle(transformedVehicle1);
        setAnalysisProgress(prev => ({ ...prev, routineMaintenance: false }));
        
        // Step 2: Perform gap analysis (uses routine maintenance + service history) → Maintenance & Due Now tab
        setAnalysisProgress(prev => ({ ...prev, gapAnalysis: true }));
        console.log('[Report] 📊 STEP 2: Performing gap analysis...');
        try {
          console.log('[Report] 🔍 Running gap analysis...', {
            vehicleData,
            hasServiceHistory: !!serviceHistory,
            routineMaintenance: routineResult.routineMaintenance || routineResult.schedule || []
          });
          
          const gapResult = await performGapAnalysis(
            vehicleData, 
            serviceHistory, 
            routineResult.routineMaintenance || routineResult.schedule || []
          );
          
          console.log('[Report] ✅ Gap analysis result:', gapResult);
          
          // Extract gap analysis data - handle different response structures
          const rawGapAnalysis = gapResult?.gapAnalysis || gapResult?.gap_analysis || gapResult;
          
          if (!rawGapAnalysis || (typeof rawGapAnalysis === 'object' && Object.keys(rawGapAnalysis).length === 0)) {
            console.warn('[Report] ⚠️ Gap analysis returned empty result:', gapResult);
            toast({
              title: "Gap Analysis Warning",
              description: "Gap analysis completed but returned no data. Continuing with workflow...",
              variant: "default"
            });
          } else {
            // Transform backend response to match frontend structure
            // Backend returns: { allItems: [...], summary: "..." }
            // Frontend expects: { items: [...], totalItems: number, overdue: number, dueNow: number, dueSoon: number }
            const allItems = rawGapAnalysis.allItems || rawGapAnalysis.items || [];
            const overdueCount = allItems.filter((item: any) => item.status === 'Overdue' || item.status === 'overdue').length;
            const dueNowCount = allItems.filter((item: any) => item.status === 'Due Now' || item.status === 'dueNow').length;
            const dueSoonCount = allItems.filter((item: any) => item.status === 'Near Future' || item.status === 'dueSoon').length;
            
            const gapAnalysisData = {
              items: allItems,
              totalItems: allItems.length,
              overdue: overdueCount,
              dueNow: dueNowCount,
              dueSoon: dueSoonCount,
              summary: rawGapAnalysis.summary
            };
            
            console.log('[Report] 📊 Transformed gap analysis:', gapAnalysisData);
            
            // Save to database immediately with merged data
            const savedData4 = await savePortfolioWithMerge({
              gapAnalysis: gapAnalysisData
            });
            updatedPortfolio = { ...updatedPortfolio, ...savedData4 };
            setPortfolio(updatedPortfolio);
            const transformedVehicle4 = portfolioToVehicle(updatedPortfolio);
            setVehicle(transformedVehicle4);
          }
          setAnalysisProgress(prev => ({ ...prev, gapAnalysis: false }));
        } catch (gapError: any) {
          console.error('[Report] ❌ Gap analysis error:', gapError);
          toast({
            title: "Gap Analysis Error",
            description: gapError.message || "Gap analysis failed. Continuing with remaining steps...",
            variant: "destructive"
          });
          // Continue workflow even if gap analysis fails
          setAnalysisProgress(prev => ({ ...prev, gapAnalysis: false }));
        }
        
        // Step 3: Get unscheduled maintenance (typical failures)
        setAnalysisProgress(prev => ({ ...prev, unscheduledMaintenance: true }));
        console.log('[Report] 📊 STEP 3: Getting unscheduled maintenance (typical failures)...');
        const unscheduledResult = await getUnscheduledMaintenance(vehicleData);
        console.log('[Report] ✅ STEP 3: Unscheduled maintenance result:', unscheduledResult);
        // Save to database immediately with merged data
        const savedData3 = await savePortfolioWithMerge({
          unscheduledMaintenance: unscheduledResult.unscheduledMaintenance || unscheduledResult.items || unscheduledResult
        });
        updatedPortfolio = { ...updatedPortfolio, ...savedData3 };
        setPortfolio(updatedPortfolio);
        const transformedVehicle3 = portfolioToVehicle(updatedPortfolio);
        setVehicle(transformedVehicle3);
        setAnalysisProgress(prev => ({ ...prev, unscheduledMaintenance: false }));
        
        // Step 4: Risk assessment (uses service history analysis + unscheduled maintenance) → Projected Future Repairs tab
        setAnalysisProgress(prev => ({ ...prev, riskEvaluation: true }));
        try {
          console.log('[Report] 📊 STEP 4: Running risk assessment...', {
            vehicleData,
            hasServiceHistory: !!serviceHistory,
            hasAnalysis: !!serviceHistoryAnalysis,
            unscheduledMaintenance: unscheduledResult.unscheduledMaintenance || unscheduledResult.items || []
          });
          
          const riskResult = await evaluateUnscheduledMaintenanceRisk(
            vehicleData,
            serviceHistory,
            serviceHistoryAnalysis,
            unscheduledResult.unscheduledMaintenance || unscheduledResult.items || []
          );
          
          console.log('[Report] ✅ Risk evaluation result:', riskResult);
          
          // Extract risk evaluation data - handle different response structures
          const riskEvaluationData = riskResult?.riskEvaluation || riskResult?.risk_evaluation || riskResult;
          
          if (!riskEvaluationData || (typeof riskEvaluationData === 'object' && Object.keys(riskEvaluationData).length === 0)) {
            console.warn('[Report] ⚠️ Risk evaluation returned empty result:', riskResult);
            toast({
              title: "Risk Evaluation Warning",
              description: "Risk evaluation completed but returned no data. Continuing with workflow...",
              variant: "default"
            });
          }
          
          // Save to database immediately with merged data
          const savedData5 = await savePortfolioWithMerge({
            riskEvaluation: riskEvaluationData
          });
          updatedPortfolio = { ...updatedPortfolio, ...savedData5 };
          setPortfolio(updatedPortfolio);
          const transformedVehicle5 = portfolioToVehicle(updatedPortfolio);
          setVehicle(transformedVehicle5);
          const leverageIds5 = (transformedVehicle5.leverageItems || []).filter((i: any) => i.id).map((i: any) => i.id);
          setSelectedLeverageIds(leverageIds5);
          setAnalysisProgress(prev => ({ ...prev, riskEvaluation: false }));
        } catch (riskError: any) {
          console.error('[Report] ❌ Risk evaluation error:', riskError);
          toast({
            title: "Risk Evaluation Error",
            description: riskError.message || "Risk evaluation failed. Continuing with remaining steps...",
            variant: "destructive"
          });
          // Continue workflow even if risk evaluation fails
          setAnalysisProgress(prev => ({ ...prev, riskEvaluation: false }));
        }
        
        // Step 5: Market evaluation → Market Valuation tab
        setAnalysisProgress(prev => ({ ...prev, marketValuation: true }));
        try {
          console.log('[Report] 📊 STEP 5: Running market evaluation...', { vehicleData });
          
          const valuationResult = await getMarketValuation(vehicleData);
          
          console.log('[Report] ✅ Market valuation result:', valuationResult);
          
          // Extract market valuation data - API returns { success: true, valuation: {...} }
          // Backend service returns { currentValuation, depreciation, depreciationCurve, ... }
          // The API wrapper already extracts .valuation, so valuationResult is the actual data
          const marketValuationData = valuationResult;
          
          if (!marketValuationData || (typeof marketValuationData === 'object' && Object.keys(marketValuationData).length === 0)) {
            console.warn('[Report] ⚠️ Market valuation returned empty result:', valuationResult);
            toast({
              title: "Market Valuation Warning",
              description: "Market valuation completed but returned no data.",
              variant: "default"
            });
          }
          
          // Save to database immediately with merged data (final save with all data)
          const savedData6 = await savePortfolioWithMerge({
            marketValuation: marketValuationData
          });
          updatedPortfolio = { ...updatedPortfolio, ...savedData6 };
          setPortfolio(updatedPortfolio);
          const transformedVehicle6 = portfolioToVehicle(updatedPortfolio);
          setVehicle(transformedVehicle6);
          setAnalysisProgress(prev => ({ ...prev, marketValuation: false }));
        } catch (valuationError: any) {
          console.error('[Report] ❌ Market valuation error:', valuationError);
          toast({
            title: "Market Valuation Error",
            description: valuationError.message || "Market valuation failed.",
            variant: "destructive"
          });
          // Continue even if valuation fails
          setAnalysisProgress(prev => ({ ...prev, marketValuation: false }));
        }

        toast({
          title: "Analysis Complete",
          description: "Full analysis has been generated.",
        });

        window.history.replaceState({}, '', `/report/${params.id}`);
      } catch (error: any) {
        console.error('Error running analysis:', error);
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to run analysis. Please try again.",
          variant: "destructive"
        });
        // Reset all progress flags on error
        setAnalysisProgress({
          serviceHistory: false,
          routineMaintenance: false,
          unscheduledMaintenance: false,
          gapAnalysis: false,
          riskEvaluation: false,
          marketValuation: false,
        });
      } finally {
        setIsRunningAnalysis(false);
      }
    };

    if (portfolio && vehicle && shouldRunAnalysis && !isRunningAnalysis) {
      runAnalysisWorkflow();
    }
  }, [shouldRunAnalysis, portfolio, vehicle, params?.id, isRunningAnalysis, toast]);

  if (isLoading) {
    return <Layout><div className="p-8">Loading vehicle data...</div></Layout>;
  }

  if (!vehicle || !portfolio) {
    return <Layout><div className="p-8">Vehicle not found</div></Layout>;
  }

  const handleToggleLeverage = (id: string) => {
    if (selectedLeverageIds.includes(id)) {
      setSelectedLeverageIds(selectedLeverageIds.filter(lid => lid !== id));
    } else {
      setSelectedLeverageIds([...selectedLeverageIds, id]);
    }
  };

  const handleRunAnalysis = () => {
    if (!params?.id) return;
    if (isRunningAnalysis) return;
    
    // Check if service history exists
    if (!portfolio?.parsedServiceHistory) {
      toast({
        title: "No Service History",
        description: "Please upload and parse a PDF first.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to the same page with runAnalysis=true to trigger the workflow
    setLocation(`/report/${params.id}?runAnalysis=true`);
  };

  // Check if vehicle has full analysis
  const hasFullAnalysis = portfolio?.riskEvaluation && portfolio?.marketValuation && portfolio?.serviceHistoryAnalysis;

  const selectedLeverageItems = vehicle?.leverageItems?.filter((i: { id?: string }) => selectedLeverageIds.includes(i.id || '')) || [];

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

        {/* Run Analysis Button - Show if analysis hasn't been run or is incomplete */}
        {(!hasFullAnalysis || isRunningAnalysis) && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                    {isRunningAnalysis ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        Analysis in Progress
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 text-primary" />
                        {hasFullAnalysis ? 'Re-run Analysis' : 'Run Full Analysis'}
                      </>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRunningAnalysis 
                      ? 'Analyzing vehicle data. This may take a few moments...'
                      : hasFullAnalysis
                        ? 'Generate a fresh analysis with updated data.'
                        : 'Generate comprehensive analysis including risk evaluation, market valuation, and maintenance forecasts.'}
                  </p>
                </div>
                {!isRunningAnalysis && (
                  <Button
                    onClick={handleRunAnalysis}
                    className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md"
                    disabled={!portfolio?.parsedServiceHistory}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    {hasFullAnalysis ? 'Re-run Analysis' : 'Run Analysis'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                <div className="flex items-center gap-2">
                  Maintenance & Due Now
                  {(analysisProgress.routineMaintenance || analysisProgress.gapAnalysis) && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="leverage" 
                className="px-1 pb-3 pt-2 h-auto rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  Leverage Builder
                  {analysisProgress.riskEvaluation && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="px-1 pb-3 pt-2 h-auto rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  Vehicle History
                  {analysisProgress.serviceHistory && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 1. SUMMARY TAB */}
          <TabsContent value="summary" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {(analysisProgress.serviceHistory || analysisProgress.riskEvaluation || analysisProgress.marketValuation) && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium">Analyzing vehicle data...</p>
                </div>
              </Card>
            )}
            {!(analysisProgress.serviceHistory || analysisProgress.riskEvaluation || analysisProgress.marketValuation) && (
              <>
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
              </>
            )}
          </TabsContent>

          {/* 2. MARKET VALUATION TAB */}
          <TabsContent value="valuation" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {analysisProgress.marketValuation && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium">Calculating market valuation...</p>
                </div>
              </Card>
            )}
            {!analysisProgress.marketValuation && (
              <>
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
              </>
            )}
          </TabsContent>

          {/* 3. PROJECTED FUTURE REPAIRS TAB */}
          <TabsContent value="repairs" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {(analysisProgress.unscheduledMaintenance || analysisProgress.riskEvaluation) && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium">Analyzing repair risks...</p>
                </div>
              </Card>
            )}
            {!(analysisProgress.unscheduledMaintenance || analysisProgress.riskEvaluation) && (
              <>
             <QuickSummary 
               title="Risk Forecast"
               verdict={`${vehicle.risks.filter((r: any) => r.riskLevel === 'High').length} High Probability Failures Detected`}
               details={`Based on mileage trends for this model, you are entering a high-risk window for ${vehicle.risks.find((r: any) => r.riskLevel === 'High')?.name || 'major components'}. Total projected exposure is $${vehicle.tco.expectedUnscheduledRepairCost.toLocaleString()}.`}
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
              </>
            )}
          </TabsContent>

          {/* 4. MAINTENANCE & DUE NOW TAB */}
          <TabsContent value="maintenance" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {(analysisProgress.routineMaintenance || analysisProgress.gapAnalysis) && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium">Analyzing maintenance schedule...</p>
                </div>
              </Card>
            )}
            {!(analysisProgress.routineMaintenance || analysisProgress.gapAnalysis) && (
              <>
             {/* Complete Maintenance Schedule - All Items */}
             <Card>
               <CardHeader>
                 <CardTitle>Complete Maintenance Schedule</CardTitle>
                 <CardDescription>
                    All routine maintenance items with urgency based on service history. <span className="text-red-600 font-medium">Red</span> = Overdue, <span className="text-amber-600 font-medium">Amber</span> = Due Soon, <span className="text-emerald-600 font-medium">Green</span> = Not Due.
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 {vehicle.gapAnalysis.items.length === 0 ? (
                   <div className="text-center py-8 text-muted-foreground">
                     <p>No maintenance gap analysis data available.</p>
                     <p className="text-sm mt-2">Run the analysis workflow to generate maintenance schedule data.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {vehicle.gapAnalysis.items.map((item: any) => {
                        // Calculate percentage based on actual gap analysis data
                        const lastDoneMiles = item.lastDoneMiles || 0;
                        const milesSinceLastService = vehicle.mileage - lastDoneMiles;
                        const percentage = item.intervalMiles > 0 
                          ? (milesSinceLastService / item.intervalMiles) * 100 
                          : 0;
                        
                        // Determine status and colors based on miles until due
                        // Red: Overdue, Yellow: 0-1000 miles until due, Green: Otherwise
                        let status: 'Overdue' | 'Due Soon' | 'Good' = 'Good';
                        let statusColor = 'bg-emerald-500';
                        let statusBadge = 'outline';
                        
                        // Calculate miles until due or overdue
                        let milesUntilDue = 0;
                        let isOverdue = false;
                        
                        if (item.lastDoneMiles === null || item.lastDoneMiles === 0) {
                          // Never performed - calculate overdue
                          const overdueMiles = vehicle.mileage > item.intervalMiles
                            ? vehicle.mileage - item.intervalMiles
                            : 0;
                          if (overdueMiles > 0) {
                            isOverdue = true;
                            milesUntilDue = -overdueMiles; // Negative for overdue
                          } else {
                            milesUntilDue = item.intervalMiles - vehicle.mileage; // Due soon
                          }
                        } else if (item.overdueByMiles && item.overdueByMiles > 0) {
                          isOverdue = true;
                          milesUntilDue = -item.overdueByMiles; // Negative for overdue
                        } else if (item.nextDueMiles) {
                          if (item.nextDueMiles <= vehicle.mileage) {
                            isOverdue = true;
                            milesUntilDue = -(vehicle.mileage - item.nextDueMiles); // Negative for overdue
                          } else {
                            milesUntilDue = item.nextDueMiles - vehicle.mileage; // Positive for due in future
                          }
                        } else {
                          // Fallback: calculate from lastDoneMiles + interval
                          const nextDue = item.lastDoneMiles + item.intervalMiles;
                          if (nextDue <= vehicle.mileage) {
                            isOverdue = true;
                            milesUntilDue = -(vehicle.mileage - nextDue);
                          } else {
                            milesUntilDue = nextDue - vehicle.mileage;
                          }
                        }
                        
                        // Set status and colors based on miles until due
                        if (isOverdue || milesUntilDue < 0) {
                          status = 'Overdue';
                          statusColor = 'bg-red-500';
                          statusBadge = 'destructive';
                        } else if (milesUntilDue >= 0 && milesUntilDue <= 1000) {
                          status = 'Due Soon';
                          statusColor = 'bg-amber-400';
                          statusBadge = 'secondary';
                        } else {
                          status = 'Good';
                          statusColor = 'bg-emerald-500';
                          statusBadge = 'default'; // Use default variant for green
                        }

                        // Cap percentage for bar visual (overdue items show full bar)
                        const barWidth = percentage > 100 ? 100 : Math.min(percentage, 100);
                        const isOverdueForBar = isOverdue || milesUntilDue < 0;
                        const milesRemaining = item.intervalMiles > 0 
                          ? Math.max(0, item.intervalMiles - milesSinceLastService)
                          : 0;

                        // Determine border color based on status
                        const borderColor = status === 'Overdue' 
                          ? 'border-red-500/50 dark:border-red-500/30' 
                          : status === 'Due Soon'
                          ? 'border-amber-400/50 dark:border-amber-400/30'
                          : 'border-emerald-500/50 dark:border-emerald-500/30';
                        
                        return (
                           <div key={item.id} className={`border-2 ${borderColor} rounded-xl p-4 bg-background hover:shadow-sm transition-all flex flex-col gap-3`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
                                            {item.item}
                                        </div>
                                        {/* Show overdue/due information here instead of "Last" */}
                                        {(() => {
                                          // Check if never performed FIRST - calculate overdue miles
                                          if (item.lastDoneMiles === null || item.lastDoneMiles === 0) {
                                            const overdueMiles = vehicle.mileage > item.intervalMiles
                                              ? vehicle.mileage - item.intervalMiles
                                              : 0;
                                            if (overdueMiles > 0) {
                                              return (
                                                <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                                  Overdue by {overdueMiles.toLocaleString()} miles
                                                </div>
                                              );
                                            } else {
                                              return (
                                                <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                                  Due now
                                                </div>
                                              );
                                            }
                                          }
                                          
                                          // Check if overdue - always show miles overdue
                                          if (item.overdueByMiles && item.overdueByMiles > 0) {
                                            return (
                                              <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                                Overdue by {item.overdueByMiles.toLocaleString()} miles
                                              </div>
                                            );
                                          }
                                          
                                          // Check if due now (nextDueMiles is in the past or at current mileage)
                                          if (item.nextDueMiles && item.nextDueMiles <= vehicle.mileage) {
                                            const overdue = vehicle.mileage - item.nextDueMiles;
                                            return (
                                              <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                                Overdue by {overdue.toLocaleString()} miles
                                              </div>
                                            );
                                          }
                                          
                                          // Check if due in the future
                                          if (item.nextDueMiles && item.nextDueMiles > vehicle.mileage) {
                                            const milesUntilDue = item.nextDueMiles - vehicle.mileage;
                                            return (
                                              <div className="text-sm font-medium text-muted-foreground">
                                                Due in {milesUntilDue.toLocaleString()} miles
                                              </div>
                                            );
                                          }
                                          
                                          return null;
                                        })()}
                                    </div>
                                    <div className="text-right ml-4">
                                         <Badge 
                                           variant={statusBadge as any} 
                                           className={`font-bold text-[10px] uppercase ${
                                             status === 'Good' 
                                               ? 'bg-emerald-500 text-white border-emerald-600' 
                                               : status === 'Due Soon'
                                               ? 'bg-amber-400 text-white border-amber-500'
                                               : ''
                                           }`}
                                         >
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
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                                            style={{ width: `${barWidth}%` }}
                                        />
                                        {isOverdueForBar && (
                                          <div className="absolute inset-0 bg-red-500 opacity-50" style={{ width: '100%' }} />
                                        )}
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>Last: {item.lastPerformed || 'Never'}</span>
                                        <span>Interval: {item.intervalMiles.toLocaleString()} mi / {item.intervalMonths} mo</span>
                                    </div>
                                </div>

                                {item.riskNote && (
                                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/40">
                                    <span className="font-semibold">Risk:</span> {item.riskNote}
                                  </div>
                                )}
                           </div>
                        );
                     })}
                   </div>
                 )}
               </CardContent>
             </Card>

             <Separator />

             {/* 3. Maintenance Cost Outlook Chart */}
             <MaintenanceCostChart vehicle={vehicle} milesPerYear={12000} />
              </>
            )}
          </TabsContent>

          {/* 6. LEVERAGE BUILDER TAB */}
          <TabsContent id="leverage-builder-section" value="leverage" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {analysisProgress.riskEvaluation && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium">Evaluating negotiation leverage...</p>
                </div>
              </Card>
            )}
            {!analysisProgress.riskEvaluation && (
              <>
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
              </>
            )}
          </TabsContent>

             {/* 7. VEHICLE HISTORY TAB */}
          <TabsContent value="history" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {analysisProgress.serviceHistory && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium">Analyzing service history...</p>
                </div>
              </Card>
            )}
            {!analysisProgress.serviceHistory && (
              <>
             
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
              </>
            )}
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

