import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Car, 
  Plus, 
  LayoutDashboard, 
  Scale, 
  Activity,
  Settings,
  FileText,
  Search,
  Wrench,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  ShieldAlert,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
  mode?: 'dtc' | 'demo';
  onModeChange?: (mode: 'dtc' | 'demo') => void;
}

export default function Layout({ children, mode: propMode, onModeChange }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [internalMode, setInternalMode] = React.useState<'dtc' | 'demo'>('dtc');
  const { toast } = useToast();

  const mode = propMode || internalMode;
  
  // Check for shared view mode via URL search params (mock implementation)
  const isSharedView = typeof window !== 'undefined' && window.location.search.includes('view=shared');

  const handleModeToggle = (newMode: 'dtc' | 'demo') => {
    setInternalMode(newMode);
    if (onModeChange) onModeChange(newMode);
    
    if (newMode === 'demo') {
      toast({
        title: "Demo Mode Active",
        description: "Showing original module-based navigation structure.",
      });
      if (location === '/') setLocation('/demo/audi-s7-2015');
    } else {
      toast({
        title: "DTC Mode Active",
        description: "Showing optimized decision-first consumer journey.",
      });
      if (location.startsWith('/demo')) setLocation('/');
    }
  };

  const navItems = mode === 'dtc' ? [
    { href: "/", label: "Garage", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    { href: "/compare", label: "Dipstick It", icon: <Scale className="w-4 h-4 mr-2" /> },
  ] : [
    { href: "/demo/audi-s7-2015", label: "Analysis Dashboard", icon: <Activity className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0F172A] text-white backdrop-blur supports-[backdrop-filter]:bg-[#0F172A]/90 shadow-md">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Link href={mode === 'dtc' ? "/" : "/demo/audi-s7-2015"} className="mr-8 flex items-center space-x-2 group pl-2" onClick={(e) => {
              if (isSharedView) e.preventDefault();
            }}>
              <div className="relative group-hover:scale-105 transition-transform duration-300 flex items-center gap-3">
                {/* Logo Icon */}
                <div className="h-9 w-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25 transform -skew-x-12 border border-emerald-400/20">
                  <div className="transform skew-x-12 font-heading font-black text-white text-xl tracking-tighter italic">D</div>
                </div>
                <span className="font-heading font-black text-xl tracking-tight text-white italic">DIPSTICK</span>
                
                {isSharedView && (
                   <span className="text-[10px] uppercase tracking-wider font-bold bg-white/10 text-white/70 px-2 py-0.5 rounded border border-white/10 ml-2">Shared View</span>
                )}
              </div>
            </Link>
            
            {!isSharedView && (
              <nav className="flex items-center space-x-1 text-sm font-medium hidden md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                      location === item.href 
                        ? "bg-white/15 text-white shadow-sm font-semibold" 
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Optional Search */}
            </div>
            
            {!isSharedView ? (
              <nav className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden sm:flex text-white/80 hover:text-white hover:bg-white/10 border-white/10">
                      <Settings className="w-4 h-4 mr-2" />
                      {mode === 'dtc' ? 'DTC Mode' : 'Demo Mode'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleModeToggle('dtc')}>
                      DTC Mode (Consumer)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleModeToggle('demo')}>
                      Demo Mode (Original)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {mode === 'dtc' && (
                  <Link href="/add">
                    <Button className="h-9 px-4 py-2 shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white border-0 font-bold">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </Link>
                )}
              </nav>
            ) : (
               <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                    Log in
                  </Button>
                  <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90 font-bold">
                    Sign up
                  </Button>
               </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {mode === 'demo' && (
          <aside className="w-64 border-r bg-muted/10 hidden lg:block overflow-y-auto shrink-0">
             <div className="p-4 space-y-1">
                <div className="font-bold px-2 mb-3 text-xs text-muted-foreground uppercase tracking-wider flex items-center">
                  <Activity className="w-3 h-3 mr-2" /> Analysis Modules
                </div>
                {[
                  { id: 'info', label: 'Vehicle Info', icon: Car },
                  { id: 'history', label: 'Parsed Service History', icon: FileText },
                  { id: 'analysis', label: 'Service History Analysis', icon: Search },
                  { id: 'routine', label: 'Routine Maintenance', icon: Wrench },
                  { id: 'unscheduled', label: 'Unscheduled Maintenance', icon: AlertTriangle },
                  { id: 'gap', label: 'Gap Analysis', icon: TrendingDown },
                  { id: 'risk', label: 'Risk Evaluation', icon: ShieldAlert },
                  { id: 'market', label: 'Market Valuation', icon: DollarSign },
                  { id: 'tco', label: 'Total Cost of Ownership', icon: BarChart3 },
                ].map((mod) => (
                  <Button 
                    key={mod.id} 
                    variant="ghost" 
                    className={`w-full justify-start font-medium h-10 px-3 ${location.includes(mod.id) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => {
                      const id = location.split('/').pop() || 'audi-s7-2015';
                      setLocation(`/demo/${id}?section=${mod.id}`);
                    }}
                  >
                    <mod.icon className="w-4 h-4 mr-3 opacity-70" />
                    {mod.label}
                  </Button>
                ))}
             </div>
          </aside>
        )}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="container py-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      {mode === 'dtc' && (
        <footer className="py-6 border-t bg-muted/5 mt-auto">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-12 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              Dipstick &copy; 2025. Built for leverage.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
