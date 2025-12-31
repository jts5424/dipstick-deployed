import React, { useState } from "react";
import { X, Crosshair, Map, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

interface MissionBriefingProps {
  title: string;
  directive: string;
  icon?: React.ReactNode;
  page: 'garage' | 'report' | 'compare';
}

export default function MissionBriefing({ title, directive, icon, page }: MissionBriefingProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const PageIcon = {
    garage: Map,
    report: FileText,
    compare: BarChart3
  }[page];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-primary/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex gap-4">
          <div className="shrink-0 mt-1">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
              <PageIcon className="w-4 h-4 text-primary animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-1 pr-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary/80">Dipstick Guide // {page.toUpperCase()}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              {directive}
            </p>
          </div>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
      </motion.div>
    </AnimatePresence>
  );
}
