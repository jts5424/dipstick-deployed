import React from "react";
import { 
  Drawer, 
  DrawerContent,
  DrawerClose
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, MessageSquare, Check, Zap, ThumbsUp, ShieldAlert, Sparkles, Printer, Mail, Share2, FileText, ClipboardList, Wand2, Smartphone, User, Search, Plus, ArrowRight, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LeverageDrawerProps {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  leverageItems: {
    id: string;
    title: string;
    negotiationAngle: string;
    questionsToAsk: string[];
    costMin: number;
    costMax: number;
    evidenceTags?: string[];
  }[];
  askingPrice?: number;
  fairPrice?: number;
  // New props for embedded mode and selection
  embedded?: boolean;
  hideHeader?: boolean;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onAutoSelect?: (ids: string[]) => void;
  isOpen?: boolean; // Alias for open to fix LSP error in report.tsx
  negotiationStyle?: 'Conservative' | 'Balanced' | 'Aggressive'; // Controlled prop
  targetOffer?: number; // Controlled prop
}

type Tone = 'collaborative' | 'direct' | 'walk-away';
type ScriptMode = 'in_person' | 'email' | 'text';
type NegotiationStyle = 'conservative' | 'balanced' | 'aggressive';
type SellerType = 'dealer' | 'private';

type ScriptTab = 'verify' | 'reality' | 'offer' | 'objections' | 'close';

// --- OBJECTION RESPONSE ENGINE ---

type ObjectionCategory = 'Price & Market' | 'Condition & Maintenance' | 'Risk & "Hypothetical"' | 'Records & Proof' | 'Dealer Tactics';

interface Objection {
  id: string;
  category: ObjectionCategory;
  trigger: string;
  sellerType?: SellerType | 'both';
}

const OBJECTION_LIBRARY: Objection[] = [
  // Price & Market
  { id: 'priced_market', category: 'Price & Market', trigger: "We priced to market / It's a fair price", sellerType: 'both' },
  { id: 'already_discounted', category: 'Price & Market', trigger: "We already discounted it", sellerType: 'both' },
  { id: 'someone_else', category: 'Price & Market', trigger: "Someone else is coming / Other offers", sellerType: 'both' },
  { id: 'best_we_can_do', category: 'Price & Market', trigger: "That's the best we can do", sellerType: 'both' },
  
  // Condition & Maintenance
  { id: 'sold_as_is', category: 'Condition & Maintenance', trigger: "Sold as-is / No warranty", sellerType: 'both' },
  { id: 'minor_issues', category: 'Condition & Maintenance', trigger: "Those issues are minor / nitpicking", sellerType: 'both' },
  { id: 'normal_wear', category: 'Condition & Maintenance', trigger: "That's just normal wear and tear", sellerType: 'both' },
  { id: 'mileage_fine', category: 'Condition & Maintenance', trigger: "The mileage is fine / Car runs great", sellerType: 'both' },

  // Risk & Hypothetical
  { id: 'risk_hypothetical', category: 'Risk & "Hypothetical"', trigger: "That risk is just hypothetical", sellerType: 'both' },
  { id: 'recall_minor', category: 'Risk & "Hypothetical"', trigger: "Recall isn't a big deal", sellerType: 'both' },
  
  // Records & Proof
  { id: 'no_records_needed', category: 'Records & Proof', trigger: "No one expects perfect records", sellerType: 'both' },
  { id: 'prove_it', category: 'Records & Proof', trigger: "Prove it / Show me evidence", sellerType: 'both' },

  // Dealer Tactics
  { id: 'fees_non_negotiable', category: 'Dealer Tactics', trigger: "Fees are non-negotiable", sellerType: 'dealer' },
  { id: 'come_in', category: 'Dealer Tactics', trigger: "Come in and we'll talk (won't do phone/text)", sellerType: 'dealer' },
];

const generateObjectionResponse = (
  objectionId: string,
  tone: Tone,
  style: NegotiationStyle,
  sellerType: SellerType,
  leverageItems: LeverageDrawerProps['leverageItems'],
  selectedIds: string[] | undefined,
  targetOffer: number
) => {
  const selectedItems = selectedIds 
    ? leverageItems.filter(i => selectedIds.includes(i.id))
    : leverageItems;
  
  const hasGaps = selectedItems.some(i => i.evidenceTags?.includes('Service Gap'));
  const hasImmediate = selectedItems.some(i => i.costMin > 0); // Roughly check for cost
  const hasSafety = selectedItems.some(i => i.negotiationAngle.toLowerCase().includes('safety'));

  // Default response structure
  let label = "I hear you.";
  let evidence = "However, there are issues.";
  let question = "How do we fix this?";
  let close = `Can we agree on $${targetOffer.toLocaleString()}?`;

  // Dynamic Logic
  switch (objectionId) {
    case 'priced_market':
      label = tone === 'collaborative' ? "I agree with your pricing for a 'clean' unit." : "That price assumes standard condition.";
      evidence = `But this car has ${selectedItems.length} specific liabilities I'll have to pay for immediately.`;
      question = "How are you accounting for that deferred maintenance in the price?";
      close = `We can stick to your price if you fix the items, or adjust to $${targetOffer.toLocaleString()} as-is.`;
      break;

    case 'already_discounted':
      label = "I appreciate the adjustment you've made.";
      evidence = hasImmediate 
        ? "The issue is that the current discount doesn't cover the immediate work needed."
        : "However, the market value has dropped further based on these specific condition flags.";
      question = "Does that discount specifically account for the [Specific Repair]?";
      close = `I need another $${Math.floor(selectedItems.reduce((a,b)=>a+b.costMin,0)/2).toLocaleString()} off to make the math work.`;
      break;

    case 'sold_as_is':
      label = "I understand 'as-is' and I'm not asking for a warranty.";
      evidence = `I'm just asking to buy the car at a price that reflects its *current* mechanical reality, not a hypothetical one.`;
      question = style === 'conservative' ? "Are you saying you won't budge even for safety items?" : "Is the price flexible if I take on 100% of the risk?";
      close = `At $${targetOffer.toLocaleString()}, I take the risk off your hands today.`;
      break;

    case 'minor_issues':
      label = "Individually, they might seem small.";
      evidence = `But collectively, they represent a $${selectedItems.reduce((a,b)=>a+b.costMin,0).toLocaleString()} liability in the first 6 months.`;
      question = "Why should I pay full retail price for a car that needs that much work?";
      close = "If they're minor, would you be willing to fix them before I buy?";
      break;
      
    case 'come_in':
      label = "I'm ready to come in today if the numbers make sense.";
      evidence = "I've done my research and I know exactly what I'm looking for.";
      question = "Can we agree on the out-the-door range first so I don't waste your time?";
      close = `If you can get close to $${targetOffer.toLocaleString()} OTD, I'll be there at 5pm.`;
      break;

    case 'risk_hypothetical':
      label = "Every used car has risk, I get that.";
      evidence = hasGaps 
        ? "But a service gap this large isn't hypothetical—it's a statistical probability of failure." 
        : "However, these specific models are known for this exact failure at this mileage.";
      question = "If it breaks tomorrow, I'm the one paying for it—so shouldn't the price reflect that risk?";
      close = `I need some buffer in the price. $${targetOffer.toLocaleString()} gives me that safety margin.`;
      break;

    // Fallbacks for others to keep it robust but simple for MVP
    default:
      label = "I understand your position.";
      evidence = `I'm just looking at the ${selectedItems.length} specific items that need attention.`;
      question = "How can we bridge this gap so we both feel good about the deal?";
      close = `I'm a buyer today at $${targetOffer.toLocaleString()}.`;
  }

  // Tone Modifiers (Post-processing)
  if (tone === 'direct') {
    label = label.replace("I agree", "I understand").replace("I hear you", "Understood");
    close = `I'm firm at $${targetOffer.toLocaleString()}.`;
  }
  if (tone === 'walk-away') {
    label = "Look, the math is the math.";
    question = "Take it or leave it?";
    close = `If $${targetOffer.toLocaleString()} doesn't work, I'm going to look at the other option I have.`;
  }

  return { label, evidence, question, close };
};

export default function LeverageDrawer({ 
  open, 
  isOpen, // handle alias
  onOpenChange, 
  leverageItems, 
  askingPrice = 0, 
  fairPrice = 0,
  embedded = false,
  hideHeader = false,
  selectedIds,
  onToggle,
  onAutoSelect,
  negotiationStyle: propStyle,
  targetOffer: propTargetOffer
}: LeverageDrawerProps) {
  const activeOpen = open ?? isOpen ?? false; // Handle both prop names
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [copiedReceipts, setCopiedReceipts] = React.useState(false);
  const [tone, setTone] = React.useState<Tone>('collaborative');
  const [scriptMode, setScriptMode] = React.useState<ScriptMode>('in_person');
  const [internalStyle, setInternalStyle] = React.useState<NegotiationStyle>('balanced');
  
  // Sync internal style with prop if provided
  React.useEffect(() => {
    if (propStyle) {
        setInternalStyle(propStyle.toLowerCase() as NegotiationStyle);
        // Auto-run strategy when global style changes
        handleBuildStrategy(propStyle.toLowerCase() as NegotiationStyle);
    }
  }, [propStyle]);

  const style = internalStyle;

  const [activeTab, setActiveTab] = React.useState<ScriptTab>('verify');
  const [sellerType, setSellerType] = React.useState<SellerType>('dealer');
  const [objectionSearch, setObjectionSearch] = React.useState('');
  const [preButtMode, setPreButtMode] = React.useState(false);


  // Filter items if selection is enabled
  const activeItems = selectedIds 
    ? leverageItems.filter(i => selectedIds.includes(i.id))
    : leverageItems;

  const totalDiscountMin = activeItems.reduce((acc, item) => acc + item.costMin, 0);
  const totalDiscountMax = activeItems.reduce((acc, item) => acc + item.costMax, 0);
  
  // Use prop target offer if available, otherwise calculate
  const targetOffer = propTargetOffer ?? (askingPrice - totalDiscountMin);
  
  const isOverpriced = askingPrice > fairPrice;

  // Dynamic Script Generation
  const generateScriptContent = (tone: Tone, mode: ScriptMode, style: NegotiationStyle) => {
    // Style modifiers
    const riskAdjective = style === 'aggressive' ? 'critical' : (style === 'balanced' ? 'significant' : 'notable');
    const riskAction = style === 'aggressive' ? 'require immediate attention' : 'will need to be addressed';
    
    // Helper for highlighting
    const Highlight = ({ children, className }: { children: React.ReactNode, className?: string }) => (
      <span className={`px-1 py-0.5 rounded mx-0.5 font-bold transition-colors duration-500 ${
        style === 'aggressive' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
        style === 'balanced' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      } ${className}`}>
        {children}
      </span>
    );

    const ToneHighlight = ({ children }: { children: React.ReactNode }) => (
      <span className={`px-1 py-0.5 rounded mx-0.5 font-bold transition-colors duration-500 ${
        tone === 'walk-away' ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200' :
        tone === 'direct' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      }`}>
        {children}
      </span>
    );

    const SourceTag = ({ title }: { title: string }) => (
      <span className="ml-2 inline-flex items-center rounded-full border border-transparent bg-slate-100 px-1.5 py-0 text-[10px] font-medium text-slate-500 uppercase tracking-wide">
        From: {title.split(':')[0]}
      </span>
    );
    
    // Mode-specific formatting
    if (mode === 'text') {
      const bullet = '•';
      
      if (tone === 'walk-away') {
        return (
          <>
            Hey, saw the car. I like it but the <Highlight>{riskAdjective}</Highlight> maintenance issues are a dealbreaker at this price:
            <br/><br/>
            {activeItems.map(item => (
               <div key={item.id} className="mb-1 p-1 bg-slate-50 dark:bg-slate-900/50 rounded flex flex-wrap items-center">
                 <span>{bullet} {item.title} ({item.negotiationAngle})</span>
                 <SourceTag title={item.title} />
               </div>
            ))}
            <br/>
            I can do <span className="font-bold">${targetOffer.toLocaleString()}</span> today given the work needed. Let me know if that works, otherwise I'll pass.
          </>
        );
      }
      return (
        <>
          Hi, interested in the vehicle. Found a few <Highlight>{riskAdjective}</Highlight> issues that need work:
          <br/><br/>
            {activeItems.map(item => (
               <div key={item.id} className="mb-1 p-1 bg-slate-50 dark:bg-slate-900/50 rounded flex flex-wrap items-center">
                 <span>{bullet} {item.title} ({item.negotiationAngle})</span>
                 <SourceTag title={item.title} />
               </div>
            ))}
          <br/>
          Based on these costs, I'm at <span className="font-bold">${targetOffer.toLocaleString()}</span>. Does that work for you?
        </>
      );
    }

    if (mode === 'email') {
      const subject = `Offer for ${activeItems.length > 0 ? 'Vehicle with Maintenance Items' : 'Vehicle'}`;
      
      return (
        <>
          <div className="text-muted-foreground mb-4 pb-4 border-b border-dashed">Subject: {subject}</div>
          Hi,
          <br/><br/>
          I'm writing to follow up on the vehicle. I've reviewed the history and condition in detail. While I'm interested, there are several <Highlight>{riskAdjective}</Highlight> maintenance liabilities I'd be inheriting:
          <br/><br/>
            {activeItems.map(item => (
               <div key={item.id} className="mb-1 p-1 bg-slate-50 dark:bg-slate-900/50 rounded flex flex-wrap items-center">
                 <span>• {item.title}: {item.negotiationAngle}</span>
                 <SourceTag title={item.title} />
               </div>
            ))}
          <br/>
          These items <Highlight>{riskAction}</Highlight> and represent real cost. Factoring this in, a fair market offer is <span className="font-bold">${targetOffer.toLocaleString()}</span>.
          <br/><br/>
          I can move forward <ToneHighlight>immediately</ToneHighlight> at this price. Let me know your thoughts.
          <br/><br/>
          Best,
        </>
      );
    }

    // Default: In-person talk track
    let intro = <></>;
    let itemTransition = <></>;
    let outro = <></>;
    const aggressiveTarget = tone === 'walk-away' ? Math.floor(targetOffer * 0.98) : targetOffer;

    switch (tone) {
      case 'collaborative':
        intro = <>Hi, I'm really interested in the vehicle and appreciate you showing it to me. I've done some research on the service history and specific model risks, and I want to be transparent about a few <Highlight>{riskAdjective}</Highlight> things I found so we can find a <ToneHighlight>fair deal for both of us</ToneHighlight>.</>;
        itemTransition = <>Specifically, I'm looking at:</>;
        outro = <>Given these future costs I'll likely incur, I feel a fair price that accounts for this maintenance would be around <span className="font-bold">${targetOffer.toLocaleString()}</span>. <ToneHighlight>Does that sound reasonable to you?</ToneHighlight></>;
        break;
      case 'direct':
        intro = <>I've reviewed the vehicle's condition and history in detail. Based on the market value and the specific deferred maintenance on this unit, the current asking price <Highlight>doesn't reflect the true cost of ownership</Highlight>.</>;
        itemTransition = <>Here are the specific liabilities I'll be inheriting:</>;
        outro = <>Factoring in these immediate and near-term costs, the <ToneHighlight>maximum I can justify offering</ToneHighlight> is <span className="font-bold">${targetOffer.toLocaleString()}</span>. I'm ready to buy today at that number.</>;
        break;
      case 'walk-away':
        intro = <>Look, I like the car, but the numbers clearly show <Highlight>{riskAdjective}</Highlight> upcoming risk that isn't priced in. I have <ToneHighlight>other options on the market</ToneHighlight> that don't have these specific exposure points.</>;
        itemTransition = <>The deal breakers for me at this price point are:</>;
        outro = <>Unless we can get to <span className="font-bold">${aggressiveTarget.toLocaleString()}</span> to cover these risks, I'm going to have to <ToneHighlight>pass and look at the other options</ToneHighlight> I have lined up.</>;
        break;
    }

    return (
      <>
        {intro}
        <br/><br/>
        {itemTransition}
        <br/><br/>
        {activeItems.map(item => {
          const bullet = tone === 'direct' ? '•' : '-';
          
          let content = null;
          if (tone === 'collaborative') {
             content = (
                <>
                  <div className="font-bold mb-1 text-emerald-800 dark:text-emerald-300">{bullet} {item.title}</div>
                  <div className="text-sm text-muted-foreground">My Question: "{item.questionsToAsk[0]}"</div>
                </>
             );
          } else if (tone === 'direct') {
             content = (
                <>
                  <div className="font-bold mb-1 text-purple-800 dark:text-purple-300">{bullet} Issue: {item.negotiationAngle}</div>
                  <div className="text-sm italic text-muted-foreground">Impact: {item.title}</div>
                </>
             );
          } else {
             // Walk away
             content = (
                <>
                  <div className="font-bold mb-1 text-red-800 dark:text-red-300">{bullet} DEALBREAKER: {item.title}</div>
                  <div className="text-sm font-medium text-foreground">Requirement: Fixed before purchase or full discount.</div>
                </>
             );
          }

          return (
            <div key={item.id} className="mb-4 pl-2 border-l-2 border-muted bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded">
               <div className="flex items-start justify-between">
                 <div className="flex-1">{content}</div>
                 <SourceTag title={item.title} />
               </div>
            </div>
          )
        })}
        <br/>
        {outro}
      </>
    );
  };
  
  // Script Variables for Copying
  const scriptDisplay = generateScriptContent(tone, scriptMode, style);
  // Simple plain text generation for clipboard
  const fullScript = `
Negotiation Script (${tone.toUpperCase()} TONE)
Target Offer: $${targetOffer.toLocaleString()}

Points:
${activeItems.map(i => `- ${i.title}: ${i.negotiationAngle}`).join('\n')}

Script:
[Intro based on tone]
[List of issues]
[Closing offer: $${targetOffer.toLocaleString()}]
  `.trim(); // This is a placeholder, a real app would replicate the render logic in plain text.

  const receiptScript = `
Hi, can you please share receipts/records for:
${activeItems.map(i => `- ${i.title}`).join('\n')}
  `.trim();

  // Handlers
  const handleCopy = () => {
    // ... existing
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    toast({
      title: "Script Copied",
      description: "Negotiation script copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleCopyReceipts = () => {
    // ... existing
    navigator.clipboard.writeText(receiptScript);
    setCopiedReceipts(true);
    toast({
      title: "Request Copied",
      description: "Receipt request list copied to clipboard.",
    });
    setTimeout(() => setCopiedReceipts(false), 2000);
  };
  
  const handleBuildStrategy = (targetStyle: NegotiationStyle = style) => {
     let newTone: Tone = 'collaborative';
     let newSelectionIds: string[] = [];

     // Logic: Style drives selection
     if (targetStyle === 'conservative') {
        newTone = 'direct'; // "I want the car, so I'll be direct but pay more" - wait, direct usually means blunt.
        // Actually, conservative means "I want the car". So 'collaborative' is better.
        newTone = 'collaborative';
        // Conservative: I only care about big ticket items.
        // Filter items > $500 or containing "Safety"
        newSelectionIds = leverageItems
           .filter(i => i.costMax > 500 || i.negotiationAngle.toLowerCase().includes('safety'))
           .map(i => i.id);
        
        if (newSelectionIds.length === 0) {
           newSelectionIds = leverageItems.slice(0, 2).map(i => i.id);
        }
     } else if (targetStyle === 'balanced') {
        newTone = 'collaborative';
        // Balanced: Top 4 items
        newSelectionIds = [...leverageItems]
           .sort((a, b) => b.costMax - a.costMax)
           .slice(0, 4)
           .map(i => i.id);
     } else {
        // Aggressive: I want a deal. 'walk-away' tone.
        newTone = 'walk-away';
        // Aggressive: Use everything as leverage.
        newSelectionIds = leverageItems.map(i => i.id);
     }

     setTone(newTone);
     
     if (onAutoSelect) {
        onAutoSelect(newSelectionIds);
        // Only toast on manual clicks (when targetStyle is undefined or same as current) to avoid spam on mount/update
        if (!propStyle) {
           toast({
               title: "Strategy Generated",
               description: `Optimized for ${targetStyle} negotiation. Selected ${newSelectionIds.length} key leverage points.`,
           });
        }
     } else {
        toast({
            title: "Strategy Updated",
            description: "Tone updated based on negotiation style.",
        });
     }
  };

  const renderObjections = () => {
    const filtered = OBJECTION_LIBRARY.filter(obj => {
      const matchesSearch = obj.trigger.toLowerCase().includes(objectionSearch.toLowerCase());
      const matchesSeller = obj.sellerType === 'both' || obj.sellerType === sellerType;
      return matchesSearch && matchesSeller;
    });

    if (filtered.length === 0) {
      return <div className="col-span-2 text-center py-8 text-muted-foreground text-xs">No objections found matching "{objectionSearch}"</div>
    }

    const byCategory = filtered.reduce((acc, obj) => {
      if (!acc[obj.category]) acc[obj.category] = [];
      acc[obj.category].push(obj);
      return acc;
    }, {} as Record<ObjectionCategory, Objection[]>);

    return Object.entries(byCategory).map(([category, items]) => (
      <div key={category} className="space-y-2 mb-6 break-inside-avoid inline-block w-full">
         <h5 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider pl-1">{category}</h5>
         {items.map(obj => {
            const response = generateObjectionResponse(
               obj.id, 
               tone, 
               style, 
               sellerType, 
               leverageItems, 
               selectedIds,
               targetOffer
            );
            
            const isPreButt = preButtMode;
            const displayText = isPreButt 
               ? `You might feel like I'm nitpicking about the ${obj.trigger.split('/')[0].toLowerCase()}...` 
               : response.label;

            return (
              <div key={obj.id} className="group border border-border/50 rounded-lg overflow-hidden bg-card hover:shadow-md transition-all">
                 <div className="bg-muted/30 px-3 py-2 border-b border-border/50 flex justify-between items-center">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">"{obj.trigger}"</span>
                 </div>
                 <div className="p-3 space-y-3">
                    {/* Label / Pre-butt */}
                    <div className="text-xs italic text-muted-foreground border-l-2 border-primary/30 pl-2">
                       {displayText}
                    </div>

                    {/* Evidence & Question */}
                    <div className="space-y-1">
                       <div className="text-xs font-medium">{response.evidence}</div>
                       <div className="text-xs font-bold text-primary">{response.question}</div>
                    </div>
                    
                    {/* Close */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                       <ArrowRight className="w-3 h-3 shrink-0" />
                       {response.close}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1 opacity-50 group-hover:opacity-100 transition-opacity">
                       <Button variant="outline" size="sm" className="h-6 text-[10px] w-full" onClick={() => {
                          const fullResponse = `${displayText} ${response.evidence} ${response.question} ${response.close}`;
                          navigator.clipboard.writeText(fullResponse);
                          toast({ description: "Response copied to clipboard" });
                       }}>
                         <Copy className="w-3 h-3 mr-1" /> Copy
                       </Button>
                       <Button variant="outline" size="sm" className="h-6 text-[10px] w-full" onClick={() => {
                          toast({ description: "Added to script Objections phase" });
                          setActiveTab('objections');
                       }}>
                         <Plus className="w-3 h-3 mr-1" /> Add
                       </Button>
                    </div>
                 </div>
                 {/* Usage Chips */}
                 <div className="bg-muted/50 px-3 py-1.5 border-t border-border/50 flex flex-wrap gap-1">
                    <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider mr-1">Uses:</span>
                    {activeItems.length > 0 ? activeItems.slice(0, 3).map(i => (
                       <Badge key={i.id} variant="secondary" className="h-4 px-1 text-[8px] bg-emerald-100/50 text-emerald-700 border-emerald-200/50">
                          {i.title}
                       </Badge>
                    )) : (
                       <span className="text-[9px] text-muted-foreground italic">Generic logic</span>
                    )}
                    {activeItems.length > 3 && (
                       <Badge variant="secondary" className="h-4 px-1 text-[8px] bg-muted text-muted-foreground">
                          +{activeItems.length - 3} more
                       </Badge>
                    )}
                 </div>
              </div>
            )
         })}
      </div>
   ));
  };

  const renderControls = () => (
      <div className={`w-full ${embedded ? 'lg:w-1/3' : 'md:w-1/3'} space-y-6 ${embedded ? '' : 'md:overflow-y-auto pr-2'}`}>
          {/* Header for embedded mode */}
          {embedded && !hideHeader && (
             <div className="pb-2 border-b border-border/40">
                <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Smart Script Builder
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure your negotiation strategy.
                </p>
             </div>
          )}

          {/* Controls Container */}
          <div className="space-y-6">
             {/* Seller Type Selector */}
             <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Seller Type
                </label>
                <Tabs value={sellerType} onValueChange={(v) => setSellerType(v as SellerType)} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 h-8">
                    <TabsTrigger value="dealer" className="text-xs h-6">Dealer</TabsTrigger>
                    <TabsTrigger value="private" className="text-xs h-6">Private Party</TabsTrigger>
                  </TabsList>
                </Tabs>
             </div>

             {/* Tone Selector */}
             <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Approach Tone
                </label>
                <Tabs value={tone} onValueChange={(v) => setTone(v as Tone)} className="w-full">
                  <TabsList className="w-full grid grid-cols-3 h-8">
                    <TabsTrigger value="collaborative" className="text-xs h-6">Friendly</TabsTrigger>
                    <TabsTrigger value="direct" className="text-xs h-6">Firm</TabsTrigger>
                    <TabsTrigger value="walk-away" className="text-xs h-6">Hard</TabsTrigger>
                  </TabsList>
                </Tabs>
             </div>

             {/* Negotiation Style Slider - Only show if NOT controlled by parent prop */}
             {!propStyle && (
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                     <ShieldAlert className="w-3.5 h-3.5" /> Negotiation Style
                   </label>
                   <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded capitalize">{style}</span>
                </div>
                <div className="pt-2 px-1">
                   <Slider 
                      defaultValue={[50]} 
                      value={[style === 'conservative' ? 0 : style === 'balanced' ? 50 : 100]}
                      max={100} 
                      step={50} 
                      className="cursor-pointer"
                      onValueChange={(vals) => {
                         const val = vals[0];
                         if (val === 0) setInternalStyle('conservative');
                         if (val === 50) setInternalStyle('balanced');
                         if (val === 100) setInternalStyle('aggressive');
                      }}
                   />
                   <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-medium">
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Aggressive</span>
                   </div>
                </div>
             </div>
             )}

             {!propStyle && (
             <Button onClick={() => handleBuildStrategy()} className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all" size="sm">
                <Wand2 className="w-4 h-4 mr-2" /> Auto-Generate Strategy
             </Button>
             )}

             {/* Calculator Section */}
             <div className="bg-muted/30 p-4 rounded-xl border border-border/60 space-y-3 shadow-sm">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Deal Math
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-muted-foreground">Asking Price:</span>
                     <span className="font-mono font-bold">${askingPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-emerald-600">
                     <span className="font-medium">Identified Leverage:</span>
                     <span className="font-mono font-bold">-${totalDiscountMin.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border/50 w-full my-1"></div>
                  <div className="flex justify-between items-center">
                     <span className="font-bold text-foreground">Target Offer:</span>
                     <span className="text-lg font-bold text-primary font-mono">${targetOffer.toLocaleString()}</span>
                  </div>
                </div>
             </div>

             {/* Selected Items List (Compact) */}
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" /> Selected Points ({activeItems.length})
                  </label>
                  <div className="flex gap-2 text-[10px] items-center">
                    <span className="flex items-center gap-1 text-muted-foreground"><div className="w-2 h-2 rounded-full border border-border bg-muted"></div> Available</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Selected</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-bold"><div className="w-2 h-2 rounded-full bg-emerald-600 ring-1 ring-emerald-200"></div> In Script</span>
                  </div>
                </div>
                <div className="space-y-2">
                   {leverageItems.map(item => {
                      const isSelected = selectedIds ? selectedIds.includes(item.id) : true;
                      return (
                      <div key={item.id} 
                           className={`text-xs p-2 rounded border shadow-sm cursor-pointer transition-all ${
                             isSelected 
                               ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500/50 ring-1 ring-emerald-500/20' 
                               : 'bg-muted/30 border-transparent opacity-60 hover:opacity-100 hover:bg-muted'
                           }`}
                           onClick={() => onToggle && onToggle(item.id)}
                      >
                         <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'bg-transparent border-muted-foreground text-transparent'
                            }`}>
                               <Check className="w-3 h-3" />
                            </div>
                            <div className="font-bold truncate flex-1">{item.title}</div>
                            {isSelected && (
                              <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-emerald-100 text-emerald-700 border-emerald-200">IN SCRIPT</Badge>
                            )}
                         </div>
                         <div className="text-muted-foreground line-clamp-2 pl-6 text-[10px]">{item.negotiationAngle}</div>
                      </div>
                   )})}
                </div>
             </div>
          </div>
      </div>
  );

  const renderPreview = () => (
      <div className={`w-full ${embedded ? 'lg:w-2/3' : 'md:w-2/3 h-full'} flex flex-col gap-6`}>
         
         <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 rounded-xl border border-border/60 shadow-xl overflow-hidden ring-1 ring-border/50">
         
         {/* Script Header */}
         <div className="bg-muted/30 border-b px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground/70 uppercase tracking-wider">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Strategy
            </div>
            
            <div className="flex bg-background/80 p-0.5 rounded-lg border border-border/60 shadow-sm overflow-x-auto max-w-full">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={`h-7 px-3 text-xs gap-1.5 whitespace-nowrap ${activeTab === 'verify' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                 onClick={() => setActiveTab('verify')}
               >
                 1. Verify
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={`h-7 px-3 text-xs gap-1.5 whitespace-nowrap ${activeTab === 'reality' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                 onClick={() => setActiveTab('reality')}
               >
                 2. Reality Check
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={`h-7 px-3 text-xs gap-1.5 whitespace-nowrap ${activeTab === 'offer' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                 onClick={() => setActiveTab('offer')}
               >
                 3. Offer
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={`h-7 px-3 text-xs gap-1.5 whitespace-nowrap ${activeTab === 'objections' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                 onClick={() => setActiveTab('objections')}
               >
                 4. Objections
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className={`h-7 px-3 text-xs gap-1.5 whitespace-nowrap ${activeTab === 'close' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                 onClick={() => setActiveTab('close')}
               >
                 5. Close
               </Button>
            </div>
         </div>
         
         {/* Script Content */}
         <div className="flex-1 relative bg-slate-50/50 dark:bg-slate-900/50 min-h-[400px]">
           <ScrollArea className={`${embedded ? 'h-[500px]' : 'h-full absolute inset-0'} w-full`}>
             <div className="p-8">
               <div className="font-mono text-sm leading-loose whitespace-pre-wrap text-foreground max-w-2xl mx-auto bg-white dark:bg-slate-950 p-8 rounded-lg border shadow-sm selection:bg-primary/20">
                 {/* Render content based on activeTab */}
                 {activeTab === 'verify' && (
                    <>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Phase 1: Receipt Request (Verify First)</div>
                      Hi, regarding the vehicle listed. I'm ready to move forward but need to verify a few specific maintenance items first. Can you please share receipts or service records for the following:
                      <br/><br/>
                      {activeItems.map(item => (
                        <div key={item.id} className="mb-1">• {item.title} (Evidence needed: {item.evidenceTags?.join(', ') || 'Service Record'})</div>
                      ))}
                      <br/>
                      If these haven't been done, I'll need to factor that into my offer. Thanks.
                    </>
                 )}
                 
                 {activeTab === 'reality' && (
                    <>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Phase 2: Reality Check Questions</div>
                      {activeItems.map(item => (
                        <div key={item.id} className="mb-6">
                           <div className="font-bold text-sm mb-1">{item.title}</div>
                           <div className="bg-muted/30 p-3 rounded border border-border/50 text-foreground italic">
                             "{item.questionsToAsk[0]}"
                           </div>
                        </div>
                      ))}
                    </>
                 )}

                 {activeTab === 'offer' && scriptDisplay}
                 
                 {activeTab === 'objections' && (
                    <div className="space-y-6">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Phase 4: Contextual Objection Handlers</div>
                      
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-red-600 uppercase tracking-wider">"We price to market"</div>
                        <p className="p-3 bg-muted/30 rounded border border-border/50 italic">
                          "I agree with your market pricing on a *clean* unit. But your price assumes standard maintenance is done. These gaps represent a liability I have to pay for immediately."
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-red-600 uppercase tracking-wider">"Sold as-is"</div>
                        <p className="p-3 bg-muted/30 rounded border border-border/50 italic">
                          "I understand as-is. I'm not asking for a warranty. I'm asking to buy the car at a price that reflects its *current* mechanical reality, not a hypothetical one."
                        </p>
                      </div>
                    </div>
                 )}

                 {activeTab === 'close' && (
                    <>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Phase 5: Close & Logistics</div>
                      If you can agree to <span className="font-bold">${targetOffer.toLocaleString()}</span> to cover these liabilities, I can come today at 6pm with a cashier's check.
                      <br/><br/>
                      I'll need:
                      <br/>
                      • Bill of sale
                      <br/>
                      • Title in hand
                      <br/>
                      • Both keys
                      <br/><br/>
                      No surprises. Does 6pm work for you?
                    </>
                 )}
               </div>
             </div>
           </ScrollArea>
         </div>

         {/* Script Footer */}
         <div className="p-4 border-t bg-background flex flex-col gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded border border-blue-100 dark:border-blue-800/30 flex gap-2.5 items-start">
               <ShieldAlert className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
               <p className="text-xs text-blue-700 dark:text-blue-300 leading-snug">
                 <span className="font-bold">Disclaimer:</span> This script uses factual leverage to build credibility. It does not guarantee price concessions, but it frames the negotiation around objective data rather than opinion.
               </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              {!embedded && <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 md:flex-none">Close</Button>}
              <Button onClick={handleCopy} className="shadow-lg min-w-[140px] font-bold flex-1 md:flex-none">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy Script"}
              </Button>
            </div>
         </div>
         </div>

      {/* Objection Response Engine - Moved to Bottom Right */}
      <div className="w-full">
            <Accordion type="single" collapsible className="w-full bg-white dark:bg-slate-950 rounded-xl border border-border/60 shadow-xl ring-1 ring-border/50" defaultValue="objections">
               <AccordionItem value="objections" className="border-0">
                 <AccordionTrigger className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-foreground hover:no-underline sticky top-0 bg-white dark:bg-slate-950 z-10 rounded-t-xl">
                   <div className="flex items-center gap-2">
                      <span>🛡️ Objection Response Engine</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs space-y-2 p-3 bg-popover text-popover-foreground border-border shadow-lg z-50">
                             <p className="font-bold border-b pb-1 mb-1">How to use:</p>
                             <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                <li>Type what they said (e.g. "priced to market")</li>
                                <li>Copy the suggested reply (it uses your selected leverage points)</li>
                                <li>If <span className="font-bold text-primary">Pre-empt Mode</span> is on, it adds a line to reduce pushback before you make your offer</li>
                                <li>Click <span className="font-bold">Add</span> to drop it into Phase 4: Objections</li>
                             </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="px-4 pb-4 space-y-4">
                   
                   {/* Controls */}
                   <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input 
                            placeholder='Search "priced to market"...' 
                            className="h-9 pl-8 text-xs bg-muted/30"
                            value={objectionSearch}
                            onChange={(e) => setObjectionSearch(e.target.value)}
                          />
                        </div>
                        <div className="px-1 text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                           <Sparkles className="w-3 h-3 text-emerald-600" /> Powered by your selected points ({activeItems.length})
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-muted/30 p-3 rounded border border-border/50">
                         <div className="flex items-center gap-2">
                            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                            <div>
                               <div className="text-xs font-medium">Pre-empt objections</div>
                               <div className="text-[9px] text-muted-foreground">Reduces defensiveness before you make your offer</div>
                            </div>
                         </div>
                         <Switch 
                           checked={preButtMode}
                           onCheckedChange={setPreButtMode}
                           className="scale-75 origin-right"
                         />
                      </div>
                   </div>

                   <div className="block columns-1 md:columns-2 gap-6 max-h-[400px] overflow-y-auto pr-1 pb-2">
                     {renderObjections()}
                   </div>
                   
                 </AccordionContent>
               </AccordionItem>
            </Accordion>
      </div>
    </div>
  );

  const renderContent = () => {
    return (
      <div className={`mx-auto w-full ${embedded ? 'flex flex-col lg:flex-row gap-8 min-h-[500px]' : 'max-w-4xl flex-1 flex flex-col'}`}>
        {!hideHeader && !embedded && (
          <div className="grid gap-1.5 p-4 text-center sm:text-left pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold leading-none tracking-tight text-2xl font-heading font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Smart Script Builder
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Customize your negotiation strategy based on {activeItems.length} selected leverage points.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {renderControls()}
        {renderPreview()}
      </div>
    );
  };

  if (embedded) {
    return renderContent();
  }

  return (
    <Drawer open={activeOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        {renderContent()}
      </DrawerContent>
    </Drawer>
  );
}
