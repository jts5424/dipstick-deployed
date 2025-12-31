import React from "react";
import { 
  AlertCircle, 
  Check, 
  Copy, 
  ExternalLink,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GlossaryTooltip } from "./GlossaryTooltip";

interface IssueCardProps {
  title: string;
  severity: 'Low' | 'Medium' | 'High';
  costRange: string;
  negotiationAngle?: string;
  questionsToAsk?: string[];
  evidenceTags: string[];
  evidence?: string;
  onAddToScript?: () => void;
  inScript?: boolean;
  onShowEvidence?: () => void;
}

export default function IssueCard({ 
  title, 
  severity, 
  costRange, 
  negotiationAngle,
  questionsToAsk,
  evidenceTags, 
  evidence,
  onAddToScript,
  inScript = false,
  onShowEvidence
}: IssueCardProps) {
  const severityColor = 
    severity === 'High' ? 'text-red-700 bg-red-50 border-red-200' : 
    severity === 'Medium' ? 'text-amber-700 bg-amber-50 border-amber-200' : 
    'text-blue-700 bg-blue-50 border-blue-200';

  return (
    <Card className={cn(
      "border border-border/60 shadow-sm transition-all duration-200 group hover:border-primary/20",
      inScript ? "bg-accent/5 border-accent/30" : "hover:shadow-md"
    )}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-2 justify-between w-full">
              <div className="flex items-center gap-2.5">
                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-bold border uppercase tracking-wider", severityColor)}>
                  {severity}
                </Badge>
                <h4 className="font-heading font-bold text-lg leading-none text-foreground tracking-tight">{title}</h4>
              </div>
              {evidence && (
                <div className="text-xs font-medium text-amber-700/90 mt-1 ml-1">
                  Evidence trigger: {evidence}
                </div>
              )}
              <div className="text-right shrink-0">
                 <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">
                   <GlossaryTooltip term="Exposure" className="border-none gap-1">Exposure</GlossaryTooltip>
                 </p>
                 <p className="text-sm font-bold font-mono text-foreground bg-muted/30 px-2 py-0.5 rounded">{costRange}</p>
              </div>
            </div>
            
            {negotiationAngle && (
              <div className="bg-gradient-to-r from-muted/50 to-transparent p-3 rounded-md text-sm text-foreground/90 border-l-2 border-primary/50">
                <span className="font-bold text-primary mr-1 text-xs uppercase tracking-wide block mb-1">Negotiation Angle</span>
                <span className="italic">"{negotiationAngle}"</span>
              </div>
            )}
            
            {questionsToAsk && questionsToAsk.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recommended Questions</span>
                <ul className="list-none ml-0 space-y-1.5">
                   {questionsToAsk.slice(0,2).map((q, i) => (
                     <li key={i} className="text-xs text-foreground/80 flex gap-2 items-start bg-muted/20 p-1.5 rounded">
                       <MessageSquare className="w-3 h-3 mt-0.5 text-primary/60 shrink-0" />
                       "{q}"
                     </li>
                   ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2 items-center justify-between border-t border-border/30 mt-2">
              <div className="flex gap-2">
                {evidenceTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-[10px] px-2 py-0.5 font-medium bg-secondary text-secondary-foreground hover:text-foreground cursor-pointer transition-colors border-0"
                    onClick={onShowEvidence}
                  >
                    {tag}
                  </Badge>
                ))}
                {onShowEvidence && (
                  <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1 text-muted-foreground hover:text-primary" onClick={onShowEvidence}>
                     <ExternalLink className="w-3 h-3 mr-1" /> View Evidence
                  </Button>
                )}
              </div>
              
              <Button 
                variant={inScript ? "default" : "outline"} 
                size="sm" 
                className={cn(
                  "h-8 shrink-0 transition-all font-bold text-xs shadow-sm", 
                  inScript && "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 ring-2 ring-emerald-100"
                )}
                onClick={onAddToScript}
              >
                {inScript ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Added to Leverage Builder
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Use Leverage
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
