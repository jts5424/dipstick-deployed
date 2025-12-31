import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  FileText, 
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldAlert,
  Check,
  Calendar,
  List,
  Eye,
  Link2,
  ThumbsUp,
  Clock,
  DollarSign
} from "lucide-react";
import { ServiceRecord } from "@/lib/mockData";
import { format, parseISO, differenceInMonths } from "date-fns";
import { Card } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const columns: ColumnDef<ServiceRecord>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("date")}</div>,
  },
  {
    accessorKey: "mileage",
    header: "Mileage",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue<number>("mileage")?.toLocaleString() || "-"}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const cat = row.getValue("category") as string;
      const color = 
        cat === 'maintenance' ? 'bg-emerald-100 text-emerald-800' :
        cat === 'repair' ? 'bg-amber-100 text-amber-800' :
        cat === 'inspection' ? 'bg-blue-100 text-blue-800' :
        'bg-slate-100 text-slate-800';
      
      const Icon = 
        cat === 'maintenance' ? Wrench :
        cat === 'repair' ? AlertTriangle :
        cat === 'inspection' ? CheckCircle2 :
        FileText;

      return (
        <Badge variant="outline" className={`capitalize border-0 ${color} pl-1.5 pr-2`}>
          <Icon className="w-3 h-3 mr-1" />
          {cat}
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium text-sm text-foreground/90" title={row.getValue("description")}>
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <div className="text-muted-foreground text-xs">{row.getValue("location")}</div>,
  },
  {
    accessorKey: "costEstimate",
    header: "Est. Cost",
    cell: ({ row }) => {
       const cost = row.getValue<number | undefined>("costEstimate");
       if (!cost) return <span className="text-muted-foreground/30 text-xs">-</span>;
       return <span className="font-mono text-xs text-muted-foreground">${cost}</span>;
    }
  }
];

interface EvidenceTableProps {
  data: ServiceRecord[];
  initialCategoryFilter?: string | string[];
}

export default function EvidenceTable({ data, initialCategoryFilter }: EvidenceTableProps) {
  const [viewMode, setViewMode] = React.useState<'table' | 'timeline'>('timeline');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  // Initialize filters based on prop (string or array)
  const initialFilters = React.useMemo(() => {
    if (!initialCategoryFilter) return [];
    const filters = Array.isArray(initialCategoryFilter) ? initialCategoryFilter : [initialCategoryFilter];
    return filters.length > 0 ? [{ id: 'category', value: filters }] : [];
  }, [initialCategoryFilter]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialFilters);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [showAdmin, setShowAdmin] = React.useState(false);
  
  // Quick Filter State
  const [quickFilter, setQuickFilter] = React.useState<'anomalies' | 'gaps' | 'repeats' | null>(null);

  const filteredData = React.useMemo(() => {
     let filtered = data;
     
     // 1. Admin Filter
     if (!showAdmin) {
       filtered = filtered.filter(d => d.category !== 'admin');
     }

     // 2. Global Search
     if (globalFilter) {
       const lower = globalFilter.toLowerCase();
       filtered = filtered.filter(d => 
         d.description.toLowerCase().includes(lower) || 
         d.location.toLowerCase().includes(lower) ||
         d.category.toLowerCase().includes(lower)
       );
     }
     
     // 3. Quick Filters
     if (quickFilter === 'anomalies') {
        filtered = filtered.filter(d => 
           d.category === 'repair' || 
           d.description.toLowerCase().includes('leak') || 
           d.description.toLowerCase().includes('noise') ||
           d.description.toLowerCase().includes('fail')
        );
     } else if (quickFilter === 'repeats') {
        // Find repeated descriptions
        const counts = new Map<string, number>();
        data.forEach(d => {
           const key = d.description.toLowerCase();
           counts.set(key, (counts.get(key) || 0) + 1);
        });
        filtered = filtered.filter(d => (counts.get(d.description.toLowerCase()) || 0) > 1);
     }
     // 'gaps' is visual only in timeline, but for table we could filter? 
     // For now, let's just let the timeline visual handle gaps, or maybe filter to records AROUND gaps?
     // Simpler: 'gaps' filter is effectively "Show me records that frame the gaps" - hard to implement simply.
     // Let's rely on the visual gap indicators in timeline for now, or maybe just filter to "Inspection" since gaps often follow inspections?
     // Actually, let's just leave 'gaps' as a visual toggle or scroll interaction if possible, but for now simple filter is safer.
     
     // Sort by date desc
     return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data, showAdmin, globalFilter, quickFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    // Custom filter function for array support
    filterFns: {
      arrIncludes: (row, columnId, filterValue: string[]) => {
         const val = row.getValue(columnId) as string;
         return filterValue.includes(val);
      }
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });
  
  // Set custom filter function on category column
  React.useEffect(() => {
     const col = table.getColumn("category");
     if (col) {
        col.columnDef.filterFn = 'arrIncludes';
     }
  }, [table]);

  const categories = ['maintenance', 'repair', 'inspection', 'admin'];

  // Timeline grouping
  const timelineGroups = React.useMemo(() => {
    // FIX: Use table's filtered rows instead of raw filteredData to respect category column filters
    const rowsToGroup = table.getFilteredRowModel().rows;
    
    const groups: { year: string; records: ServiceRecord[] }[] = [];
    rowsToGroup.forEach(row => {
      const record = row.original;
      const year = record.date.substring(0, 4);
      const existing = groups.find(g => g.year === year);
      if (existing) {
        existing.records.push(record);
      } else {
        groups.push({ year, records: [record] });
      }
    });
    return groups;
  }, [table.getFilteredRowModel().rows]);

  // Mock Insight Logic
  const getInsight = (record: ServiceRecord) => {
    if (record.description.toLowerCase().includes('oil')) {
      return { type: 'positive', text: 'On Schedule', icon: Clock, color: 'text-emerald-600 bg-emerald-50' };
    }
    if (record.description.toLowerCase().includes('repair') || record.category === 'repair') {
      return { type: 'neutral', text: 'Value Add', icon: DollarSign, color: 'text-blue-600 bg-blue-50' };
    }
    if (record.description.toLowerCase().includes('inspection')) {
      return { type: 'info', text: 'Visual Only', icon: Eye, color: 'text-amber-600 bg-amber-50' };
    }
    return null;
  };
  
  // Helper to toggle category filter
  const toggleCategory = (cat: string) => {
     const current = (table.getColumn("category")?.getFilterValue() as string[]) || [];
     const newFilters = current.includes(cat) 
        ? current.filter(c => c !== cat)
        : [...current, cat];
        
     table.getColumn("category")?.setFilterValue(newFilters.length ? newFilters : undefined);
  };

  const isCategoryActive = (cat: string) => {
     const current = (table.getColumn("category")?.getFilterValue() as string[]) || [];
     // If undefined, all are active? No, usually undefined means no filter.
     // But we initialized it.
     if (!current || current.length === 0) return false; // Or true if we want "all" behavior when empty
     return current.includes(cat);
  };

  return (
    <div className="space-y-4">
      {/* Legend & Quick Chips */}
      <div className="flex flex-col gap-3 bg-muted/30 p-3 rounded-lg border border-border/40">
        
        {/* Quick Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
           <span className="text-xs font-bold uppercase text-muted-foreground mr-2 shrink-0">Quick Filter:</span>
           <Badge 
             variant={quickFilter === 'anomalies' ? 'default' : 'outline'} 
             className={`cursor-pointer transition-colors ${
                quickFilter === 'anomalies' 
                   ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' 
                   : 'hover:bg-primary/5 border-dashed'
             }`}
             onClick={() => setQuickFilter(quickFilter === 'anomalies' ? null : 'anomalies')}
           >
             <AlertTriangle className="w-3 h-3 mr-1.5" />
             Show Anomalies
           </Badge>
           <Badge 
             variant={quickFilter === 'gaps' ? 'default' : 'outline'} 
             className={`cursor-pointer transition-colors ${
                quickFilter === 'gaps' 
                   ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' 
                   : 'hover:bg-primary/5 border-dashed'
             }`}
             onClick={() => setQuickFilter(quickFilter === 'gaps' ? null : 'gaps')}
           >
             <History className="w-3 h-3 mr-1.5" />
             Show Gaps
           </Badge>
           <Badge 
             variant={quickFilter === 'repeats' ? 'default' : 'outline'} 
             className={`cursor-pointer transition-colors ${
                quickFilter === 'repeats' 
                   ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' 
                   : 'hover:bg-primary/5 border-dashed'
             }`}
             onClick={() => setQuickFilter(quickFilter === 'repeats' ? null : 'repeats')}
           >
             <List className="w-3 h-3 mr-1.5" />
             Show Repeats
           </Badge>
           
           {quickFilter && (
             <Button variant="ghost" size="sm" className="h-5 px-2 text-[10px] ml-auto text-muted-foreground" onClick={() => setQuickFilter(null)}>
               Clear
             </Button>
           )}
        </div>

        <div className="h-px bg-border/50 w-full" />

        {/* Categories & Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
          <span className="uppercase tracking-wide font-bold mr-2 text-foreground/80 bg-muted px-2 py-0.5 rounded text-[10px]">KEY:</span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" /> Maintenance
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>Routine scheduled services (Oil, Fluids, Filters)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" /> Inspection
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>Diagnostic checks and health reports</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" /> Repair
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>Unscheduled fixes and part replacements</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records (e.g., 'brakes', 'oil')..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
           <div className="flex bg-muted/50 p-1 rounded-lg mr-2">
              <Button 
                variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 px-3 text-xs"
                onClick={() => setViewMode('table')}
              >
                <List className="w-3.5 h-3.5 mr-2" /> Table
              </Button>
              <Button 
                variant={viewMode === 'timeline' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="h-7 px-3 text-xs"
                onClick={() => setViewMode('timeline')}
              >
                <History className="w-3.5 h-3.5 mr-2" /> Timeline
              </Button>
           </div>
           
           <div className="flex items-center space-x-2 mr-2">
             <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer" onClick={() => setShowAdmin(!showAdmin)}>
               <div className={`w-4 h-4 rounded border flex items-center justify-center ${showAdmin ? 'bg-primary border-primary' : 'border-input'}`}>
                 {showAdmin && <Check className="w-3 h-3 text-white" />}
               </div>
               <span className="text-muted-foreground">Show Admin</span>
             </label>
           </div>
           
           <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

           {categories.filter(c => showAdmin || c !== 'admin').map(cat => {
              const isActive = isCategoryActive(cat);
              const activeStyles = 
                 cat === 'maintenance' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 shadow-sm' :
                 cat === 'repair' ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 shadow-sm' :
                 cat === 'inspection' ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 shadow-sm' :
                 'bg-primary text-primary-foreground'; // fallback/admin

              return (
              <Button
                key={cat}
                variant="outline"
                size="sm"
                onClick={() => toggleCategory(cat)}
                className={isActive ? activeStyles + " capitalize border" : "capitalize text-muted-foreground border-transparent"}
              >
                {cat}
              </Button>
            )})}
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="rounded-md border border-border/60 overflow-hidden bg-background shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/40 transition-colors border-border/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                     <div className="flex flex-col items-center justify-center gap-2">
                       <History className="w-8 h-8 opacity-20" />
                       <p>No records found matching your filters.</p>
                     </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="space-y-8 relative pl-6 border-l-[3px] border-border/40 ml-6 pb-12">
           <TooltipProvider>
           {timelineGroups.map((group, groupIdx) => (
             <div key={group.year} id={`group-${group.year}`} className="relative">
               <div className="absolute -left-[39px] top-0 bg-background border-2 border-border rounded-lg px-3 py-1 text-sm font-bold text-foreground shadow-sm z-10">
                 {group.year}
               </div>
               <div className="space-y-4 pt-4">
                 {group.records.map((record) => {
                   const insight = getInsight(record);
                   return (
                   <div key={record.id} className="flex gap-6 items-start group relative">
                     <div className={`absolute -left-[30px] top-4 w-3 h-3 rounded-full border-2 border-background group-hover:scale-125 transition-all z-10 ${
                        record.category === 'maintenance' ? 'bg-emerald-500' :
                        record.category === 'repair' ? 'bg-amber-500' :
                        'bg-blue-500'
                     }`} />
                     
                     <Card className="flex-1 p-0 border-border/40 bg-background hover:bg-muted/5 hover:border-border/80 transition-all shadow-sm group-hover:shadow-md overflow-hidden flex flex-col md:flex-row">
                       
                       {/* Left Color Strip */}
                       <div className={`w-1 md:w-1.5 h-full absolute left-0 top-0 bottom-0 ${
                          record.category === 'maintenance' ? 'bg-emerald-500' :
                          record.category === 'repair' ? 'bg-amber-500' :
                          'bg-blue-500'
                       }`} />

                       <div className="p-4 flex-1 flex flex-col md:flex-row gap-4 items-start md:items-center">
                         <div className="flex flex-col gap-1 flex-1">
                           <div className="flex items-center gap-2">
                             <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wide">{format(parseISO(record.date), "MMM d")}</span>
                             {insight && (
                               <Badge variant="secondary" className={`h-5 text-[10px] px-1.5 font-bold ${insight.color}`}>
                                  <insight.icon className="w-3 h-3 mr-1" /> {insight.text}
                               </Badge>
                             )}
                           </div>
                           <span className="font-bold text-base text-foreground flex items-center gap-2">
                             {record.description}
                           </span>
                           <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1.5">
                                 <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                                 </div>
                                 {record.location}
                              </span>
                              {record.costEstimate && (
                                <span className="font-mono font-medium text-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                                  ${record.costEstimate}
                                </span>
                              )}
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                           <div className="text-right">
                              <div className="font-mono text-sm font-bold text-foreground">
                                {record.mileage?.toLocaleString() || "---"} <span className="text-xs text-muted-foreground font-sans">mi</span>
                              </div>
                              <div className="text-[10px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Verified Source
                              </div>
                           </div>
                           
                           <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Original Receipt</TooltipContent>
                              </Tooltip>
                              {record.category === 'repair' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-600">
                                      <ThumbsUp className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Value Added Repair</TooltipContent>
                                </Tooltip>
                              )}
                           </div>
                         </div>
                       </div>
                     </Card>
                   </div>
                   );
                 })}
                 
                 {/* Smart Gap Detection */}
                 {groupIdx < timelineGroups.length - 1 && (
                    parseInt(group.year) - parseInt(timelineGroups[groupIdx+1].year) > 1 && (
                      <div className="py-6 flex gap-4 items-center pl-[2px] group/gap">
                        <div className="w-[3px] h-20 border-l-[3px] border-dashed border-red-300/50 absolute -left-[3px]" />
                        <div className="flex-1 bg-red-50/50 border border-red-100/60 rounded-xl p-4 flex items-center gap-4 ml-8 relative shadow-sm hover:bg-red-50 transition-colors">
                           <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 shadow-inner">
                             <AlertTriangle className="w-6 h-6 text-red-600" />
                           </div>
                           <div className="flex-1">
                             <div className="font-bold text-red-900 text-sm">Critical Maintenance Gap Detected</div>
                             <div className="text-xs text-red-700/80 mt-1 leading-relaxed">
                               {parseInt(group.year) - parseInt(timelineGroups[groupIdx+1].year)} years of missing history. 
                               Check for "garage queen" issues: dried seals, flat spots, or undisclosed storage damage.
                             </div>
                           </div>
                           <div className="flex flex-col gap-1">
                              <Button size="sm" variant="outline" className="text-red-700 border-red-200 hover:bg-red-100 text-xs h-7">
                                Ask Seller
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-600 hover:text-red-800 hover:bg-red-100/50 text-[10px] h-6"
                                onClick={(e) => {
                                   e.preventDefault();
                                   // Logic to visually highlight or scroll - for now just a smooth behavior
                                   // In a real app we might scroll to the next record
                                   const nextElement = document.getElementById(`group-${timelineGroups[groupIdx+1].year}`);
                                   if (nextElement) nextElement.scrollIntoView({ behavior: 'smooth' });
                                }}
                              >
                                Jump to gap years
                              </Button>
                           </div>
                        </div>
                      </div>
                    )
                 )}
               </div>
             </div>
           ))}
           </TooltipProvider>
           {timelineGroups.length === 0 && (
             <div className="text-center text-muted-foreground py-12">No records found.</div>
           )}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center pt-2">
        Showing {filteredData.length} records.
      </div>
    </div>
  );
}
