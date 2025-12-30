import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Layout from "@/components/Layout";
import { vehicles } from "@/lib/mockData";
import VehicleCard from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>(vehicles.map(v => v.id)); // Default select all for "Comparator as Home"
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessingNew, setIsProcessingNew] = useState(false);

  useEffect(() => {
    // Check for 'new=true' query param
    if (window.location.search.includes('new=true')) {
        setIsProcessingNew(true);
        // Clean up URL
        window.history.replaceState({}, '', '/');
        
        // Simulate "Processing" finishing after a few seconds
        setTimeout(() => {
            setIsProcessingNew(false);
            toast({
                title: "Analysis Complete",
                description: "Your vehicle has been fully analyzed.",
            });
        }, 3000);
    }
  }, [toast]);

  const handleCompareToggle = (id: string, selected: boolean) => {
    if (selected) {
      if (selectedForCompare.length >= 10) {
        toast({
          title: "Limit Reached",
          description: "You can compare up to 10 vehicles at a time.",
          variant: "destructive"
        });
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    } else {
      setSelectedForCompare(selectedForCompare.filter(vid => vid !== id));
    }
  };

  const handleCompareClick = () => {
    if (selectedForCompare.length < 1) { 
       return;
    }
    const ids = selectedForCompare.join(",");
    setLocation(`/compare?ids=${ids}`);
  };

  // Mock vehicle for processing state
  const processingVehicle = {
      id: "processing-1",
      make: "Audi",
      model: "S7",
      year: 2015,
      trim: "Prestige",
      vin: "WAU2GFAFC7FN01234",
      mileage: 84320,
      location: "San Francisco, CA",
      imageUrl: "https://images.unsplash.com/photo-1603584173870-7b299f589836?auto=format&fit=crop&q=80&w=2070",
      scores: {
        conditionScore: 0,
        riskLevel: "Processing" as const,
        historyScore: 0
      },
      tco: {
        totalCost: 0,
        totalLoss: 0,
        costPerMile: 0
      },
      leverageItems: [],
      history: {
          owners: 0,
          accidents: 0,
          serviceRecords: 0,
          lastServiceDate: "",
          titleBrand: false
      }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto pb-32">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Garage</h1>
            <p className="text-muted-foreground mt-1 font-medium">
              Vehicle portfolio • Start your search • Upload vehicle history report
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Show Processing Card if new vehicle added */}
          {isProcessingNew && (
             <div className="relative animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="absolute inset-0 z-20 bg-background/50 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-xl border-2 border-primary/20">
                    <div className="bg-background p-4 rounded-full shadow-lg mb-3 border border-border">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Analyzing Vehicle...</h3>
                    <p className="text-sm text-muted-foreground">Building risk model</p>
                </div>
                {/* @ts-ignore - Mocking vehicle prop partially */}
                <VehicleCard vehicle={processingVehicle} />
             </div>
          )}

          {vehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onCompareToggle={handleCompareToggle}
              isSelectedForCompare={selectedForCompare.includes(vehicle.id)}
            />
          ))}
          
          {/* Add New Placeholder - Redesigned */}
          <Link href="/add">
             <div className="h-full min-h-[400px] border-2 border-dashed border-emerald-500/30 rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-emerald-500 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer group p-8 text-center bg-emerald-50/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
                
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-500 group-hover:text-white border-2 border-emerald-200 group-hover:border-emerald-500 flex items-center justify-center mb-6 transition-all shadow-sm group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] group-hover:scale-110 relative z-10">
                  <Plus className="w-10 h-10 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-heading font-black text-foreground mb-2 uppercase tracking-wide group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Add Vehicle</h3>
                <p className="text-sm max-w-[200px] font-medium text-muted-foreground/80 group-hover:text-emerald-600/80 transition-colors">Upload a vehicle history report to add to your garage.</p>
              </div>
          </Link>
        </div>

        {selectedForCompare.length > 0 && (
           <div 
             className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#0F172A] text-white pl-6 pr-2 py-2 rounded-full shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300 ring-2 ring-white/10 cursor-pointer hover:scale-[1.02] transition-transform backdrop-blur-md supports-[backdrop-filter]:bg-[#0F172A]/90"
             onClick={handleCompareClick}
           >
              <div className="flex items-center gap-3 pointer-events-none">
                 <span className="font-bold text-sm uppercase tracking-wider">Compare Set ({selectedForCompare.length})</span>
                 <div className="h-4 w-px bg-white/20" />
                 <Button 
                    size="sm" 
                    className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-6 pointer-events-auto" 
                    onClick={(e) => { e.stopPropagation(); handleCompareClick(); }}
                 >
                    Compare {selectedForCompare.length > 2 && `(${selectedForCompare.length})`} <ArrowRight className="ml-2 w-4 h-4" />
                 </Button>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setSelectedForCompare([]); }}
              >
                 <span className="sr-only">Clear</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
           </div>
        )}
      </div>
    </Layout>
  );
}
