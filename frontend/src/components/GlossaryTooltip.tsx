import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const GLOSSARY = {
  "Dipstick Score": "A proprietary 0-100 rating combining vehicle condition, market value, and reliability history. Higher is better.",
  "Fair Price Range": "The estimated market value based on recent sales of similar vehicles with comparable mileage and condition.",
  "3-Year TCO": "Total Cost of Ownership over 3 years. Includes projected depreciation, routine maintenance, and expected repairs.",
  "Risk Level": "The probability of facing major mechanical failures in the next 3 years based on model history and mileage.",
  "Risk Severity": "A combined assessment of immediate repair needs, critical service gaps, and model-specific failure probabilities.",
  "Depreciation": "The amount of value the vehicle loses over time. This is typically the largest hidden cost of car ownership.",
  "Routine Maintenance": "Scheduled services like oil changes and tire rotations required to keep the warranty valid and car running.",
  "Unscheduled Repairs": "Unexpected failures (like water pumps or gaskets) that are common for this specific model and mileage.",
  "Gap Analysis": "Checks for missing service records. Gaps can indicate neglect or 'off-the-books' repairs.",
  "Service Gaps": "Periods where required maintenance was not documented. These create financial risk as you may be buying a car with 'deferred maintenance'.",
  "Survivability": "The statistical likelihood of specific components (like timing chains) surviving past a certain mileage.",
  "Leverage": "Specific mechanical or history issues you can use to negotiate a lower purchase price.",
  "Exposure": "The potential financial liability you face if known risks turn into actual failures.",
  "Safety Recalls": "Official safety warnings from the manufacturer. Open recalls must be fixed by a dealer for free, but can indicate a negligent previous owner.",
  "Condition Score": "An assessment of the vehicle's physical and mechanical state based on service records.",
  "Deal Score": "A proprietary 0-100 rating combining price-to-market value, condition, and predicted reliability. Scores above 85 are considered 'Excellent'.",
  "Market Status": "Compares this vehicle's asking price to the local market average for the same year, make, model, and trim with similar mileage.",
  "Risk Urgency Map": "Visualizes upcoming repair risks by cost (Y-axis) and when they are likely to happen (X-axis)."
};

interface GlossaryTooltipProps {
  term: keyof typeof GLOSSARY | string;
  definition?: string;
  children?: React.ReactNode;
  className?: string;
}

export function GlossaryTooltip({ term, definition, children, className }: GlossaryTooltipProps) {
  const text = definition || GLOSSARY[term as keyof typeof GLOSSARY];

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help border-b border-dotted border-muted-foreground/50 inline-flex items-center gap-1", className)}>
            {children || term}
            <Info className="w-3 h-3 text-muted-foreground/70" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm bg-popover text-popover-foreground shadow-lg border-border">
          <p className="font-semibold mb-1">{term}</p>
          <p className="text-muted-foreground">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
