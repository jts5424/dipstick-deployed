import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Layout from "@/components/Layout";
// Removed mockVehicles import - garage only shows real data from database
import { getAllPortfolios, getPortfolio, savePortfolio, analyzeServiceHistory, getRoutineMaintenance, getUnscheduledMaintenance, performGapAnalysis, evaluateUnscheduledMaintenanceRisk, getMarketValuation } from "@/lib/api";
import { portfolioToVehicle } from "@/lib/portfolioTransform";
import type { Vehicle } from "@/lib/mockData";
import { Activity } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]); // Start empty - load from API
  const [portfolios, setPortfolios] = useState<any[]>([]); // Store raw portfolios to check analysis status
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  // Removed isProcessingNew - no longer needed
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load portfolios from API
    const loadPortfolios = async () => {
      try {
        setIsLoading(true);
        console.log('[Home] 📡 Loading portfolios from API...');
        const result = await getAllPortfolios();
        console.log('[Home] 📦 API response:', result);
        
        if (result.portfolios && result.portfolios.length > 0) {
          console.log('[Home] ✅ Found', result.portfolios.length, 'portfolios');
          // Store raw portfolios
          setPortfolios(result.portfolios);
          // Transform portfolios to vehicles
          const transformedVehicles = result.portfolios.map(portfolioToVehicle);
          setVehicles(transformedVehicles);
          // Select all by default for comparison
          setSelectedForCompare(transformedVehicles.map(v => v.id));
        } else {
          // No portfolios yet - show empty state, NO mock data
          setVehicles([]);
          setPortfolios([]);
          setSelectedForCompare([]);
        }
      } catch (error) {
        console.error('Error loading portfolios:', error);
        toast({
          title: "Error Loading Vehicles",
          description: "Make sure the backend is running.",
          variant: "destructive"
        });
        // No fallback to mock data - show empty state
        setVehicles([]);
        setPortfolios([]);
        setSelectedForCompare([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolios();

    // Check for 'new=true' query param - reload immediately
    if (window.location.search.includes('new=true')) {
        // Clean up URL immediately
        window.history.replaceState({}, '', '/');
        
        // Reload portfolios immediately to show the new vehicle
        console.log('[Home] 🔄 Reloading portfolios after new vehicle added');
        loadPortfolios().then(() => {
            console.log('[Home] ✅ Portfolios reloaded, new vehicle should appear');
            toast({
                title: "Vehicle Added",
                description: "Your vehicle has been added to the garage.",
            });
        });
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

  const handleRunAnalysis = (portfolioId: string) => {
    // Redirect to report page with runAnalysis query param
    const fullPortfolioId = portfolioId.startsWith('portfolio_') ? portfolioId : `portfolio_${portfolioId}`;
    setLocation(`/report/${fullPortfolioId}?runAnalysis=true`);
  };

  // Removed processingVehicle - no dummy data in garage

  if (isLoading) {
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
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

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
          
          {/* Only show real vehicles from database - NO dummy data */}
          {vehicles.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-muted-foreground">No vehicles in garage yet. Click "Add Vehicle" to get started.</p>
            </div>
          ) : (
            vehicles.map((vehicle) => {
            // Check if portfolio has full analysis (has serviceHistoryAnalysis)
            // vehicle.id has 'portfolio_' prefix stripped, so we need to find by matching
            const portfolio = portfolios.find(p => {
              const portfolioIdWithoutPrefix = p.portfolioId.replace('portfolio_', '');
              return portfolioIdWithoutPrefix === vehicle.id || p.portfolioId === vehicle.id;
            });
            const hasFullAnalysis = portfolio?.serviceHistoryAnalysis !== null && portfolio?.serviceHistoryAnalysis !== undefined;
            
            if (!portfolio) {
              console.error('Portfolio not found for vehicle:', vehicle.id);
              return null;
            }
            
            return (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                portfolioId={portfolio.portfolioId}
                onCompareToggle={handleCompareToggle}
                isSelectedForCompare={selectedForCompare.includes(vehicle.id)}
                onRunAnalysis={handleRunAnalysis}
                hasFullAnalysis={hasFullAnalysis}
              />
            );
          }).filter(Boolean)
          )}
          
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
