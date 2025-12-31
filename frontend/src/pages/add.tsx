import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle2, AlertCircle, Car, ArrowRight, Loader2, Info, ChevronLeft, ShieldCheck, Search, Activity, AlertTriangle, Brain, Lock, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { parsePdf, savePortfolio, analyzeServiceHistory } from "@/lib/api";

type AddMethod = 'upload' | 'vin' | 'manual' | null;
type ParsingState = 'idle' | 'uploading' | 'extracting' | 'detecting' | 'building' | 'complete';

const RacingLoader = ({ progress }: { progress: number }) => {
  return (
    <div className="relative h-48 w-full overflow-hidden bg-background/50 border border-border/50 rounded-xl mb-6">
      {/* Sky/Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white/10 dark:from-blue-900/10 dark:to-background/5" />
      
      {/* Road */}
      <div className="absolute bottom-0 h-16 w-full bg-muted/30 border-t border-border flex items-center justify-center">
         {/* Road Lines */}
         <div className="w-full border-t-2 border-dashed border-muted-foreground/20" />
      </div>

      {/* Progress Car */}
      <div 
        className="absolute bottom-8 z-10 transition-all duration-700 ease-out transform -translate-x-1/2"
        style={{ left: `${Math.min(Math.max(progress, 10), 90)}%` }}
      >
         <Car className="w-10 h-10 text-emerald-600 fill-emerald-600/10 drop-shadow-sm" />
         
         {/* Speed lines trailing behind */}
         {progress > 10 && progress < 100 && (
            <div className="absolute top-3 -left-4 flex flex-col gap-1 opacity-40">
                <div className="w-6 h-[1px] bg-emerald-500/50" />
                <div className="w-4 h-[1px] bg-emerald-500/30 ml-2" />
            </div>
         )}
      </div>

      {/* Ghost/Comparison Car (Slower) */}
      <div 
        className="absolute bottom-10 z-0 scale-75 blur-[0.5px] opacity-30 transition-all duration-1000 ease-out transform -translate-x-1/2"
        style={{ left: `${Math.min(Math.max(progress * 0.7, 5), 85)}%` }}
      >
         <Car className="w-10 h-10 text-muted-foreground fill-muted/20" />
      </div>
    </div>
  );
};

const DidYouKnow = () => {
    const tips = [
        "Regular oil changes can extend engine life by 50%.",
        "Gaps in service history often hide major repairs.",
        "Depreciation is the single biggest cost of ownership.",
        "Dipstick finds value that standard reports miss."
    ];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % tips.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-8 pt-6 border-t border-border/40 animate-in fade-in slide-in-from-bottom-2 duration-700">
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Did you know?</p>
             <p className="text-sm font-medium text-foreground min-h-[20px] transition-all duration-500 key={index}">
                {tips[index]}
             </p>
        </div>
    );
};


export default function AddVehicle() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<AddMethod>(null);
  const [parsingState, setParsingState] = useState<ParsingState>('idle');
  const [progress, setProgress] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailedStatus, setDetailedStatus] = useState("Initializing...");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [parsedServiceHistory, setParsedServiceHistory] = useState<any>(null);
  const [isParsingDialogOpen, setIsParsingDialogOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    trim: "",
    engine: "",
    vin: ""
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[Frontend] 📁 File input changed');
    const file = e.target.files?.[0];
    console.log('[Frontend] 📄 Selected file:', file?.name, file?.type, file ? `(${(file.size / 1024).toFixed(2)} KB)` : 'NO FILE');
    if (file && file.type === 'application/pdf') {
      console.log('[Frontend] ✅ Valid PDF, setting file and opening dialog');
      setPdfFile(file);
      setIsParsingDialogOpen(true);
    } else {
      console.log('[Frontend] ❌ Invalid file type');
      toast({
        title: "Invalid File",
        description: "Please select a PDF file.",
        variant: "destructive"
      });
    }
  };

  const handleParsePdf = async () => {
    console.log('[Frontend] 🚀 handleParsePdf called');
    if (!pdfFile) {
      console.log('[Frontend] ❌ No PDF file to parse');
      return;
    }

    console.log('[Frontend] 📤 Starting PDF parse for:', pdfFile.name);
    
    // Close dialog and ensure we're on step 2
    setIsParsingDialogOpen(false);
    setStep(2);
    
    // Set parsing state immediately to show loading screen
    setProgress(0);
    setDetailedStatus("Scanning document structure...");
    setParsingState('uploading');
    
    console.log('[Frontend] 📊 State updated - parsingState: uploading, step: 2, progress: 0');
    
    // Force multiple renders to ensure React processes the state updates
    await new Promise(resolve => setTimeout(resolve, 100));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    
    console.log('[Frontend] 📊 After delay - checking if loading screen should show');

    try {
      // Update progress states
      setParsingState('extracting');
      setDetailedStatus("Extracting service dates...");
      setProgress(20);
      console.log('[Frontend] 📊 Progress: 20%, state: extracting');

      // Call real API
      console.log('[Frontend] 📡 Calling parsePdf API...');
      let result;
      try {
        result = await parsePdf(pdfFile);
        console.log('[Frontend] ✅ API call completed, result:', result);
      } catch (apiError) {
        console.error('[Frontend] ❌ API call failed:', apiError);
        throw apiError;
      }
      
      setProgress(60);
      setDetailedStatus("Normalizing mileage data...");
      console.log('[Frontend] 📊 Progress: 60%');
      
      setProgress(80);
      setDetailedStatus("Checking for major gaps...");
      console.log('[Frontend] 📊 Progress: 80%');
      
      setParsingState('detecting');
      setDetailedStatus("Analyzing maintenance intervals...");
      console.log('[Frontend] 📊 Parsing state: detecting');
      
      setProgress(90);
      setDetailedStatus("Generating risk score...");
      console.log('[Frontend] 📊 Progress: 90%');
      
      // Store parsed service history
      const serviceHistory = result.serviceHistory || result;
      console.log('[Frontend] 💾 Storing parsed service history:', {
        hasRecords: !!serviceHistory?.records,
        recordCount: serviceHistory?.records?.length || 0,
        hasVehicleInfo: !!serviceHistory?.vehicleInfo
      });
      setParsedServiceHistory(serviceHistory);
      
      // Extract vehicle info if available
      const vehicleInfo = result.serviceHistory?.vehicleInfo || result.vehicleInfo || {};
      const metadata = result.serviceHistory?.metadata || result.metadata || {};
      const highestMileage = metadata.mileageRange?.highest || null;

      // Prepare updated form data with vehicle info
      const updatedFormData = {
        make: vehicleInfo.make || formData.make,
        model: vehicleInfo.model || formData.model,
        year: vehicleInfo.year?.toString() || formData.year,
        trim: vehicleInfo.trim || formData.trim,
        engine: vehicleInfo.engine || formData.engine,
        vin: vehicleInfo.vin || formData.vin,
        mileage: highestMileage ? highestMileage.toString() : formData.mileage
      };

      // Auto-populate form if vehicle info exists
      if (vehicleInfo.make || vehicleInfo.model || vehicleInfo.year) {
        setFormData(updatedFormData);
      }

      setProgress(100);
      setParsingState('complete');
      setDetailedStatus("Analysis complete!");
      
      console.log('[Frontend] ✅ Parsing complete!', {
        records: result.serviceHistory?.records?.length || 0,
        vehicleInfo: vehicleInfo,
        parsedData: result.serviceHistory,
        updatedFormData: updatedFormData
      });
      
      // Auto-save portfolio immediately after parsing
      try {
        const vehicleData = {
          make: updatedFormData.make.trim() || '',
          model: updatedFormData.model.trim() || '',
          year: updatedFormData.year ? parseInt(updatedFormData.year) : new Date().getFullYear(),
          mileage: updatedFormData.mileage ? parseInt(updatedFormData.mileage.replace(/,/g, '')) : (highestMileage ? parseInt(highestMileage.toString().replace(/,/g, '')) : 0),
          trim: updatedFormData.trim?.trim() || undefined,
          engine: updatedFormData.engine?.trim() || undefined,
          vin: updatedFormData.vin?.trim() || undefined
        };

        // Validate we have minimum required data
        if (!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.mileage) {
          console.warn('[Frontend] ⚠️ Missing required vehicle data, will wait for user to fill form');
          toast({
            title: "PDF Parsed Successfully",
            description: `Found ${result.serviceHistory?.records?.length || 0} service records. Please confirm vehicle details.`,
          });
        } else {
          // Step 1: Analyze service history (this is done during parsing)
          console.log('[Frontend] 🔍 Analyzing service history...');
          let serviceHistoryAnalysis = null;
          try {
            const analysisResult = await analyzeServiceHistory(vehicleData, serviceHistory);
            if (analysisResult && analysisResult.analysis) {
              serviceHistoryAnalysis = analysisResult.analysis;
              console.log('[Frontend] ✅ Service history analysis complete');
            }
          } catch (analysisError) {
            console.error('[Frontend] ⚠️ Service history analysis failed:', analysisError);
            // Continue anyway - we still have parsed history
          }
          
          // Save portfolio with parsed service history AND analysis
          const portfolioData = {
            vehicleData,
            parsedServiceHistory: serviceHistory || null,
            serviceHistoryAnalysis: serviceHistoryAnalysis,
            routineMaintenance: null,
            unscheduledMaintenance: null,
            gapAnalysis: null,
            riskEvaluation: null,
            marketValuation: null,
            totalCostOfOwnership: null
          };

          console.log('[Frontend] 💾 Auto-saving portfolio after parsing...', portfolioData);
          const saveResponse = await savePortfolio(portfolioData);
          const portfolioId = saveResponse.portfolioId || saveResponse.portfolio?.portfolioId;
          
          console.log('[Frontend] ✅ Portfolio auto-saved!', portfolioId);
          
          toast({
            title: "PDF Parsed Successfully",
            description: `Found ${result.serviceHistory?.records?.length || 0} service records. Redirecting to vehicle history...`,
          });
          
          // Redirect to report page with history tab
          setTimeout(() => {
            setLocation(`/report/${portfolioId}?tab=history`);
          }, 1000);
        }
      } catch (saveError: any) {
        console.error('[Frontend] ❌ Error auto-saving portfolio:', saveError);
        toast({
          title: "PDF Parsed Successfully",
          description: `Found ${result.serviceHistory?.records?.length || 0} service records. Please save manually.`,
        });
      }
    } catch (error: any) {
      console.error('[Frontend] ❌ Error parsing PDF:', error);
      console.error('[Frontend] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setParsingState('idle');
      setProgress(0);
      toast({
        title: "Parsing Failed",
        description: error.message || "Failed to parse PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMethodSelect = (selectedMethod: AddMethod) => {
    console.log('[Frontend] 🎯 handleMethodSelect called with:', selectedMethod);
    setMethod(selectedMethod);
    setStep(2);
    
    if (selectedMethod === 'upload') {
      // Trigger file input
      console.log('[Frontend] 📁 Attempting to trigger file input...');
      const fileInput = document.getElementById('pdf-file-input') as HTMLInputElement;
      if (fileInput) {
        console.log('[Frontend] ✅ File input found, clicking...');
        fileInput.click();
      } else {
        console.error('[Frontend] ❌ File input element not found!');
      }
    } else if (selectedMethod === 'vin') {
      setParsingState('complete');
      // Prefill mock data for VIN method
      setFormData({
        make: "Audi",
        model: "S7",
        year: "2015",
        mileage: "",
        trim: "Prestige",
        engine: "4.0L V8 Twin Turbo",
        vin: "WAU2GFAFC7FN01234"
      });
    } else {
      setParsingState('complete');
      // Reset form for manual
       setFormData({
        make: "",
        model: "",
        year: "",
        mileage: "",
        trim: "",
        engine: "",
        vin: ""
      });
    }
  };

  const simulateParsing = () => {
    setParsingState('uploading');
    setDetailedStatus("Scanning document structure...");
    setProgress(0);
    
    // Smooth progress simulation
    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 90) {
                clearInterval(interval);
                return 90;
            }
            // Non-linear progress for realism
            const increment = Math.max(1, (90 - prev) / 20); 
            return prev + increment;
        });
    }, 100);

    // State triggers
    setTimeout(() => {
        setParsingState('extracting');
        setDetailedStatus("Extracting service dates...");
    }, 1000);
    
    setTimeout(() => setDetailedStatus("Normalizing mileage data..."), 2500);
    
    setTimeout(() => {
        setDetailedStatus("Checking for major gaps...");
    }, 3500);
    
    setTimeout(() => {
        setParsingState('detecting');
        setDetailedStatus("Analyzing maintenance intervals...");
    }, 4500);
    
    setTimeout(() => setDetailedStatus("Calculating depreciation curves..."), 6000);
    
    setTimeout(() => {
        setParsingState('building');
        setDetailedStatus("Generating risk score...");
    }, 7500);
    
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setParsingState('complete');
      setDetailedStatus("Analysis complete!");
      // Auto-fill mock data after "parsing"
      setFormData({
        make: "Audi",
        model: "S7",
        year: "2015",
        mileage: "84,320",
        trim: "Prestige",
        engine: "4.0L V8 Twin Turbo",
        vin: "WAU2GFAFC7FN01234"
      });
    }, 9000); 
  };

  const handleSave = async () => {
    console.log('[Frontend] 💾 handleSave called', {
      method,
      formData,
      hasParsedHistory: !!parsedServiceHistory
    });
    
    // Validate required fields
    if (method === 'manual') {
        if (!formData.make || !formData.model || !formData.year || !formData.mileage) {
             toast({
                title: "Missing Information",
                description: "Please fill in Make, Model, Year, and Mileage.",
                variant: "destructive"
              });
              return;
        }
    } else if (method === 'vin') {
        if (!formData.vin) {
           toast({
                title: "Missing Information",
                description: "VIN is required.",
                variant: "destructive"
              });
            return;
        }
        if (!formData.mileage) {
            toast({
              title: "Missing Information",
              description: "Please enter current mileage.",
              variant: "destructive"
            });
            return;
        }
    } else {
         // Upload case - need parsed history
         if (!parsedServiceHistory) {
            toast({
              title: "PDF Not Parsed",
              description: "Please upload and parse a PDF first.",
              variant: "destructive"
            });
            return;
         }
         if (!formData.make || !formData.model || !formData.year || !formData.mileage) {
            toast({
              title: "Missing Information",
              description: "Please fill in Make, Model, Year, and Mileage.",
              variant: "destructive"
            });
            return;
          }
    }
    
    try {
      // Prepare vehicle data
      const vehicleData = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage.replace(/,/g, '')),
        trim: formData.trim.trim() || undefined,
        engine: formData.engine.trim() || undefined,
        vin: formData.vin.trim() || undefined
      };

      // Save portfolio with ONLY parsed service history (no full analysis yet)
      const portfolioData = {
        vehicleData,
        parsedServiceHistory: parsedServiceHistory || null,
        // All other fields null - no analysis yet
        serviceHistoryAnalysis: null,
        routineMaintenance: null,
        unscheduledMaintenance: null,
        gapAnalysis: null,
        riskEvaluation: null,
        marketValuation: null,
        totalCostOfOwnership: null
      };

      console.log('[Frontend] 📤 Saving portfolio...', portfolioData);
      const saveResponse = await savePortfolio(portfolioData);
      
      console.log('[Frontend] ✅ Portfolio saved successfully!', saveResponse);
      
      if (!saveResponse || (!saveResponse.portfolioId && !saveResponse.success)) {
        console.error('[Frontend] ❌ Invalid save response:', saveResponse);
        throw new Error('Failed to save portfolio - invalid response');
      }
      
      const portfolioId = saveResponse.portfolioId || saveResponse.portfolio?.portfolioId;
      
      toast({
        title: "Vehicle Saved",
        description: "Vehicle added to garage successfully!",
      });
      
      // Redirect to Garage - the ?new=true will trigger a reload
      console.log('[Frontend] 🏠 Navigating to home page with portfolioId:', portfolioId);
      setLocation("/?new=true");
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save vehicle. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Add a vehicle</h1>
        <p className="text-muted-foreground text-lg">
          Start fast. Uploading a history report gives the best analysis.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Hidden file input */}
        <input
          type="file"
          id="pdf-file-input"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        {/* Option A: Upload PDF */}
        <Card 
          className="relative cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 group border-2 border-dashed border-emerald-500/20"
          onClick={() => {
            console.log('[Frontend] 🖱️ Upload PDF card clicked');
            handleMethodSelect('upload');
          }}
        >
          <div className="absolute top-4 right-4">
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">Recommended</Badge>
          </div>
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>Upload vehicle history report (PDF)</CardTitle>
            <CardDescription className="text-base">
              Works with reports like CARFAX, AutoCheck, dealer service PDFs.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Option B: Enter VIN */}
        <Card 
          className="cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
          onClick={() => handleMethodSelect('vin')}
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Enter VIN</CardTitle>
            <CardDescription className="text-base">
              Creates the vehicle and enables recall checks. Upload report later for full analysis.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Option C: Manual Entry */}
        <Card 
          className="cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-300 group"
          onClick={() => handleMethodSelect('manual')}
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle>Manual Entry</CardTitle>
            <CardDescription className="text-base">
              Basic tracking only. Limited risk and history insights.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="text-center pt-8 space-y-4">
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Upload reports you own/have rights to use. Dipstick is not affiliated with any vehicle history provider.
          <br />
          Files are encrypted at rest and stored privately.
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" className="text-muted-foreground gap-2">
              <Info className="w-4 h-4" />
              What PDF works?
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supported PDF Reports</DialogTitle>
              <DialogDescription>
                We currently support standard vehicle history reports.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Vehicle history reports (PDF) work best.</h4>
                  <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                    Upload a report you own/have rights to use.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100">Other Reports</h4>
                  <p className="text-sm text-orange-800/80 dark:text-orange-200/80">
                    Some dealer service PDFs may parse, but results can be incomplete.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t text-sm text-muted-foreground text-center">
                Dipstick is not affiliated with any vehicle history provider.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* PDF Parsing Dialog */}
      <Dialog open={isParsingDialogOpen} onOpenChange={setIsParsingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Parse PDF</DialogTitle>
            <DialogDescription>
              Ready to parse {pdfFile?.name || 'the PDF file'}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setIsParsingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleParsePdf} className="bg-emerald-600 hover:bg-emerald-700">
              Parse PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderParsingState = () => (
    <div className="max-w-xl mx-auto space-y-8 py-8 text-center animate-in fade-in zoom-in-95 duration-500">
      
      {/* Replaced generic spinner with Racing Loader */}
      <RacingLoader progress={progress} />
      
      <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight mb-2">Analyzing your vehicle...</h2>
            <p className="text-base font-medium text-emerald-600 animate-pulse transition-all duration-300 min-h-[24px]">{detailedStatus}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
           {[
             { label: "Extracting service history", minProgress: 0 },
             { label: "Validating mileage consistency", minProgress: 15 },
             { label: "Identifying maintenance gaps", minProgress: 30 },
             { label: "Projecting future repairs", minProgress: 50 },
             { label: "Calibrating market value", minProgress: 70 },
             { label: "Building negotiation leverage", minProgress: 85 }
           ].map((step, idx) => {
              const isComplete = progress > step.minProgress + 15;
              const isActive = progress >= step.minProgress && !isComplete;
              const isPending = progress < step.minProgress;

              return (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
                      isActive ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800" : 
                      isComplete ? "bg-muted/30 border-transparent opacity-80" : 
                      "border-transparent opacity-40"
                  }`}>
                    <div className="shrink-0">
                        {isComplete ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm animate-in zoom-in">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                        ) : isActive ? (
                            <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                        ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted" />
                        )}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"}`}>
                        {step.label}
                    </span>
                  </div>
              )
           })}
        </div>

        {/* Added "Did you know?" section */}
        <DidYouKnow />

      </div>
    </div>
  );

  const renderStep2 = () => {
    console.log('[Frontend] 🎨 renderStep2 called', {
      method,
      parsingState,
      hasPdfFile: !!pdfFile,
      hasParsedHistory: !!parsedServiceHistory,
      step: 2
    });
    
    // Show parsing UI if we're actually parsing (uploading, extracting, detecting, building)
    const isParsing = parsingState === 'uploading' || parsingState === 'extracting' || parsingState === 'detecting' || parsingState === 'building';
    const shouldShowParsing = method === 'upload' && isParsing;
    
    console.log('[Frontend] 🔍 Should show parsing UI?', shouldShowParsing, {
      method,
      parsingState,
      isParsing,
      condition: `method === 'upload' (${method === 'upload'}) && isParsing (${isParsing})`
    });
    
    if (shouldShowParsing) {
      console.log('[Frontend] 📊 ✅ RETURNING parsing state UI - loading screen should show now!');
      return renderParsingState();
    } else {
      console.log('[Frontend] 📊 ❌ NOT showing parsing UI, showing form instead');
    }
    
    // If upload method but no file selected yet, go back to step 1
    if (method === 'upload' && !pdfFile) {
      console.log('[Frontend] ⚠️ Upload method selected but no file - going back to step 1');
      setStep(1);
      return null;
    }

    let title = "Confirm vehicle details";
    let subtext = "";
    let banner = null;
    let cta = "Save Vehicle";

    if (method === 'vin') {
        title = "Confirm VIN details";
        subtext = "We'll decode the vehicle and enable recall checks.";
        banner = (
            <Card className="bg-amber-500/5 border-amber-500/20 mb-6">
                <CardContent className="py-4 px-4 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                         <h4 className="font-semibold text-amber-900 dark:text-amber-100">Limited analysis until you upload a vehicle history report</h4>
                         <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                            Upload a vehicle history report (PDF) to unlock full history, gaps, and risk insights.
                         </p>
                    </div>
                </CardContent>
            </Card>
        );
        cta = "Create vehicle";
    } else if (method === 'manual') {
        title = "Enter vehicle details";
        subtext = "Basic tracking. Add a VIN or PDF later for deeper analysis.";
         banner = (
            <Card className="bg-muted/50 border-border mb-6">
                <CardContent className="py-4 px-4 flex items-center gap-3">
                    <Info className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div>
                         <h4 className="font-semibold">Basic mode</h4>
                         <p className="text-sm text-muted-foreground">
                            Some insights will be limited until a vehicle history report (PDF) is uploaded.
                         </p>
                    </div>
                </CardContent>
            </Card>
        );
        cta = "Save vehicle";
    } else if (method === 'upload' && parsedServiceHistory) {
        // ONLY show success if we actually have parsed data
        title = "Looks good?";
        subtext = "We extracted these details from your report.";
        cta = "Save & build analysis";
    } else if (method === 'upload') {
        // Upload method but no parsed data - show message to parse
        title = "Select PDF file";
        subtext = "Please select a PDF file to parse.";
        cta = "Go back";
    }

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">
              {subtext}
            </p>
          </div>
        </div>

        {method === 'upload' && parsedServiceHistory && (
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="pt-6">
                  {/* Parsing Success Summary for Upload Method - ONLY show if parsed */}
                  {parsedServiceHistory ? (
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <div>
                            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Parsed successfully</h3>
                            <div className="flex gap-4 text-sm text-emerald-800/80 dark:text-emerald-200/80 mt-1">
                                <span>Records found: {parsedServiceHistory?.records?.length || 0}</span>
                                {parsedServiceHistory?.metadata?.gapCount !== undefined && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-emerald-500/50 self-center" />
                                    <span>Gaps detected: {parsedServiceHistory.metadata.gapCount}</span>
                                  </>
                                )}
                            </div>
                        </div>
                        </div>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 bg-emerald-500/10">
                            Mileage confidence: Medium
                        </Badge>
                     </div>
                  ) : null}
              
                <div className="mt-4 flex items-start gap-2 text-sm text-amber-600/90 bg-amber-500/10 p-3 rounded-md">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Gaps aren’t always bad, but they reduce certainty and increase risk exposure.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {banner}

        <Card>
          <CardContent className="pt-6 space-y-6">
             {method === 'vin' && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-3 rounded-md flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 mb-6">
                    <CheckCircle2 className="w-4 h-4" /> VIN decoded — Audi • S7 • 2015
                </div>
            )}

            {/* VIN Field - Show first if method is VIN or Manual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="vin">
                    {method === 'vin' ? 'VIN' : method === 'upload' ? 'VIN (Recommended)' : 'VIN (Optional)'}
                </Label>
                <span className="text-xs text-muted-foreground">
                    {method === 'manual' ? "Adding a VIN enables recall validation." : method === 'upload' ? "Needed for recall validation and verification." : "Used for recall validation and verification."}
                </span>
              </div>
              
              {/* VIN Input and Validation States */}
              <div className="relative">
                  <Input 
                    id="vin" 
                    value={formData.vin} 
                    onChange={(e) => setFormData({...formData, vin: e.target.value})}
                    placeholder="17-character VIN" 
                    className={method === 'vin' && !formData.vin ? "border-amber-200 focus-visible:ring-amber-200" : ""}
                    disabled={method === 'upload' || (method === 'vin' && formData.vin.length >= 17)} 
                  />
                   {/* Decoding Spinner for VIN Method */}
                   {method === 'vin' && formData.vin.length > 0 && formData.vin.length < 17 && (
                       <div className="absolute right-3 top-3 text-xs text-muted-foreground flex items-center gap-1">
                           <Loader2 className="w-3 h-3 animate-spin" /> Decoding...
                       </div>
                   )}
              </div>

              {/* Validation Messages */}
              {method === 'vin' && !formData.vin && (
                <div className="text-xs text-amber-600 animate-in fade-in slide-in-from-top-1">
                   VIN must be 17 characters.
                </div>
              )}
               {method === 'manual' && formData.vin && (
                   <div className="flex items-center gap-2 text-xs text-emerald-600 mt-1 animate-in fade-in slide-in-from-top-1">
                      <CheckCircle2 className="w-3 h-3" />
                      VIN ready for recall checks.
                   </div>
               )}
               {method === 'upload' && !formData.vin && (
                   <div className="flex items-center gap-2 text-xs text-amber-600 animate-in fade-in slide-in-from-top-1">
                      <AlertTriangle className="w-3 h-3" />
                      Recall validation won’t be available until a VIN is added.
                   </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <div className="relative">
                    <Input 
                        id="make" 
                        value={formData.make} 
                        onChange={(e) => setFormData({...formData, make: e.target.value})}
                        placeholder="e.g. Audi" 
                        disabled={method === 'vin' || method === 'upload'}
                    />
                    {(method === 'vin' || method === 'upload') && <Lock className="w-3 h-3 absolute right-3 top-3 text-muted-foreground opacity-50" />}
                     {method === 'upload' && <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 h-5 bg-muted text-muted-foreground font-normal">From PDF</Badge>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <div className="relative">
                    <Input 
                        id="model" 
                        value={formData.model} 
                        onChange={(e) => setFormData({...formData, model: e.target.value})}
                        placeholder="e.g. S7" 
                        disabled={method === 'vin' || method === 'upload'}
                    />
                    {(method === 'vin' || method === 'upload') && <Lock className="w-3 h-3 absolute right-3 top-3 text-muted-foreground opacity-50" />}
                    {method === 'upload' && <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 h-5 bg-muted text-muted-foreground font-normal">From PDF</Badge>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <div className="relative">
                    <Input 
                        id="year" 
                        value={formData.year} 
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        placeholder="e.g. 2015" 
                        disabled={method === 'vin' || method === 'upload'}
                    />
                     {(method === 'vin' || method === 'upload') && (
                         <div className="absolute right-3 top-3 flex items-center gap-2">
                             <Lock className="w-3 h-3 text-muted-foreground opacity-50" />
                             <span className="text-xs text-primary cursor-pointer hover:underline">Edit</span>
                         </div>
                     )}
                     {method === 'upload' && <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 h-5 bg-muted text-muted-foreground font-normal">From PDF</Badge>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Current Mileage</Label>
                <Input 
                  id="mileage" 
                  value={formData.mileage} 
                  onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                  placeholder="e.g. 84,000" 
                />
                 {method === 'upload' && <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 h-5 bg-muted text-muted-foreground font-normal">From PDF</Badge>}
                  {method === 'vin' && <p className="text-[10px] text-muted-foreground mt-1">Used for risk windows and depreciation.</p>}
              </div>
            </div>

             {method !== 'manual' && (
                <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="border rounded-md bg-muted/5">
                   <CollapsibleTrigger asChild>
                     <Button variant="ghost" size="sm" className="w-full flex justify-between items-center p-3 text-sm text-muted-foreground hover:text-foreground">
                        <span>More details (Trim, Engine)</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDetailsOpen ? 'rotate-180' : ''}`} />
                     </Button>
                   </CollapsibleTrigger>
                   <CollapsibleContent className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="trim">Trim (Optional)</Label>
                            <div className="relative">
                                <Input 
                                id="trim" 
                                value={formData.trim} 
                                onChange={(e) => setFormData({...formData, trim: e.target.value})}
                                placeholder="e.g. Prestige" 
                                disabled={method === 'vin' || method === 'upload'} 
                                />
                                {(method === 'vin' || method === 'upload') && <Lock className="w-3 h-3 absolute right-3 top-3 text-muted-foreground opacity-50" />}
                                {method === 'upload' && <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 h-5 bg-muted text-muted-foreground font-normal">From PDF</Badge>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="engine">Engine (Optional)</Label>
                            <div className="relative">
                                <Input 
                                id="engine" 
                                value={formData.engine} 
                                onChange={(e) => setFormData({...formData, engine: e.target.value})}
                                placeholder="e.g. 4.0L V8" 
                                disabled={method === 'vin' || method === 'upload'}
                                />
                                {(method === 'vin' || method === 'upload') && <Lock className="w-3 h-3 absolute right-3 top-3 text-muted-foreground opacity-50" />}
                                {method === 'upload' && <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 h-5 bg-muted text-muted-foreground font-normal">From PDF</Badge>}
                            </div>
                        </div>
                      </div>
                   </CollapsibleContent>
                </Collapsible>
              )}

          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t bg-muted/5 py-6">
            <div className="flex justify-between items-center w-full">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                
                <div className="flex items-center gap-4">
                    {method !== 'upload' && (
                        <Button variant="link" className="text-muted-foreground h-auto p-0" onClick={() => handleMethodSelect('upload')}>
                            {method === 'vin' ? 'Upload PDF instead' : 'Upload PDF for best results'}
                        </Button>
                    )}
                    <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]">
                    {cta}
                    </Button>
                </div>
            </div>
            
            {method === 'upload' && (
                <div className="text-center w-full">
                    <p className="text-xs text-muted-foreground">
                        You can edit these details later in your Garage.
                    </p>
                </div>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col justify-center py-10">
        {step === 1 && renderStep1()}
        {step === 2 && (() => {
          console.log('[Frontend] 🎬 Rendering step 2, parsingState:', parsingState, 'method:', method);
          return renderStep2();
        })()}
      </div>
    </Layout>
  );
}
