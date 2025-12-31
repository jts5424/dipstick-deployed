import React, { useState, useEffect } from "react";
import { useRoute, useLocation, useSearch } from "wouter";
import Layout from "@/components/Layout";
import { getVehicle } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  FileText, 
  Upload, 
  ArrowRight,
  Trash2,
  Trash
} from "lucide-react";
import EvidenceTable from "@/components/EvidenceTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DemoPage() {
  const [match, params] = useRoute("/demo/:id");
  // Handle /demo route as well
  const [matchBase] = useRoute("/demo");
  
  const [location, setLocation] = useLocation();
  const search = useSearch();
  
  // Determine vehicle ID: 
  // 1. explicit param
  // 2. if empty param but on /demo, default
  // 3. if param provided but vehicle not found, fallback to default (handled below)
  const requestedId = params?.id;
  const defaultId = "audi-s7-2015";
  
  let vehicle = requestedId ? getVehicle(requestedId) : getVehicle(defaultId);
  
  // If still no vehicle (e.g. requested ID was invalid), fallback to default
  if (!vehicle && requestedId) {
     vehicle = getVehicle(defaultId);
  }

  // Get section from URL query param
  const searchParams = new URLSearchParams(search);
  const activeSection = searchParams.get('section') || 'info';

  const [isAnalyzed, setIsAnalyzed] = useState(true);

  if (!vehicle) {
    return <Layout mode="demo"><div>Vehicle not found</div></Layout>;
  }

  const renderSection = () => {
    switch(activeSection) {
      case 'info':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold tracking-tight">Vehicle Information</h2>
               <Button variant="destructive" size="sm" className="opacity-80 hover:opacity-100">
                  <Trash2 className="w-4 h-4 mr-2" /> Clear Form
               </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
                <CardDescription>Verify the vehicle details extracted from the VIN or listing.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label>Make</Label>
                    <Input value={vehicle.make} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input value={vehicle.model} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input value={vehicle.year} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Mileage</Label>
                    <Input value={vehicle.mileage} readOnly />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Trim</Label>
                    <Input value={vehicle.trim} readOnly />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>VIN</Label>
                    <Input value={vehicle.vin} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Service History Import</h2>
            {/* Upload Section Simulation */}
            <Card>
              <CardHeader>
                <CardTitle>Service History PDF</CardTitle>
                <CardDescription>Upload Carfax or Dealer service records PDF for analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 border rounded-md p-2 bg-muted/10 text-muted-foreground text-sm flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    carfax_audi_s7.pdf
                  </div>
                  <Button variant="outline" disabled className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Parsed
                  </Button>
                </div>
                
                <Alert className="mt-4 bg-emerald-50 text-emerald-800 border-emerald-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    PDF parsed successfully! {vehicle.serviceRecords.length} service records found. Vehicle info auto-populated.
                  </AlertDescription>
                </Alert>

                {!isAnalyzed && (
                  <Button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold" size="lg" onClick={() => setIsAnalyzed(true)}>
                    Analyze
                  </Button>
                )}
              </CardContent>
            </Card>

            {isAnalyzed && (
              <>
                <div className="flex justify-between items-center pt-4">
                  <h2 className="text-2xl font-bold tracking-tight">Parsed Service History ({vehicle.serviceRecords.length} records)</h2>
                </div>
                
                <p className="text-muted-foreground text-sm">Review the extracted service history below.</p>

                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <EvidenceTable data={vehicle.serviceRecords} />
                </div>
              </>
            )}
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Service History Expert Analysis</h2>
            </div>

            {/* Overall Evaluation */}
            <div className="border-l-4 border-blue-500 bg-blue-50/50 p-6 rounded-r-lg">
              <h3 className="font-bold text-lg mb-2 text-blue-900">Overall Evaluation</h3>
              <p className="text-blue-900/80 leading-relaxed">
                {vehicle.expertAnalysis.overallEvaluation || "The service history shows a generally consistent maintenance pattern with some concerning anomalies. While regular inspections are present, specific gaps and repeated minor services suggest areas for deeper inspection."}
              </p>
            </div>

            {/* Suspicious Patterns */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Suspicious Patterns</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-700 flex items-center gap-2">
                      Multiple oil changes in a short time frame <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">High Severity</Badge>
                    </h4>
                    <p className="text-sm text-foreground/80 mt-1">
                      The vehicle underwent two oil changes within a week (2025-10-09 and 2025-10-13) which is highly unusual and suggests possible underlying issues such as oil leaks or contamination.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">Related records: Oil and filter changed on 2025-10-09, Oil change on 2025-10-13</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-700 flex items-center gap-2">
                      Frequent tire services and alignments <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Medium Severity</Badge>
                    </h4>
                    <p className="text-sm text-foreground/80 mt-1">
                      The records indicate multiple tire checks, alignments, and balancing services, which may suggest issues with suspension or alignment that could lead to uneven tire wear.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">Related records: Tire condition and pressure checked on 2015-05-14, Four wheel alignment performed on 2016-02-09, Multiple tire services in 2018</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Anomalies & Concerns */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Anomalies & Concerns</h3>
              
              <div className="space-y-4">
                {vehicle.expertAnalysis.gaps.map((gap, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        Gaps in service history <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Gap</Badge>
                      </h4>
                      <p className="text-sm text-foreground/80 mt-1">{gap.text.split('\n')[0]}</p>
                      <p className="text-xs text-amber-600 mt-1 font-medium">{gap.text.split('\n')[1]}</p>
                    </div>
                  </div>
                ))}

                {vehicle.expertAnalysis.inconsistentMileage.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        Inconsistent mileage reporting <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Missing</Badge>
                      </h4>
                      <p className="text-sm text-foreground/80 mt-1">{item.text.split('\n')[0]}</p>
                      <p className="text-xs text-red-600 mt-1 font-medium">{item.text.split('\n')[1]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services > Normal */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Services Performed More Than Normal</h3>
              
              {vehicle.expertAnalysis.servicesPerformedMoreThanNormal.map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <div>
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      {item.split('\n')[0]}
                    </h4>
                    <p className="text-sm text-foreground/80 mt-1">{item.split('\n')[1]}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.split('\n')[2]}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Expert Notes */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b pb-2">Expert Notes</h3>
              <ul className="space-y-3">
                {vehicle.expertAnalysis.expertNotes.map((note, i) => {
                  const [title, content] = note.split(': ');
                  return (
                    <li key={i} className="flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-2 shrink-0" />
                      <div>
                        <span className="font-bold text-foreground">{title}:</span> <span className="text-foreground/80">{content}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );

      case 'routine':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Routine Maintenance Schedule</h2>
              <Button variant="destructive" size="sm" className="opacity-80 hover:opacity-100">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Section
              </Button>
            </div>
             <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                       <TableHeader className="bg-[#1e60b0] hover:bg-[#1e60b0]">
                         <TableRow className="hover:bg-[#1e60b0] border-b-0">
                           <TableHead className="text-white font-bold h-10 w-[20%]">Item</TableHead>
                           <TableHead className="text-white font-bold h-10 w-[15%]">Interval (Miles)</TableHead>
                           <TableHead className="text-white font-bold h-10 w-[15%]">Interval (Months)</TableHead>
                           <TableHead className="text-white font-bold h-10 w-[15%]">Cost Range</TableHead>
                           <TableHead className="text-white font-bold h-10 w-[10%]">OEM Cost</TableHead>
                           <TableHead className="text-white font-bold h-10 w-[25%]">Description</TableHead>
                           <TableHead className="text-white font-bold h-10 w-[25%]">Risk Note</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {vehicle.routineMaintenanceSchedule.map((item, i) => (
                           <TableRow key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-muted/10"}>
                             <TableCell className="font-medium align-top py-3">{item.item}</TableCell>
                             <TableCell className="align-top py-3">{item.intervalMiles.toLocaleString()}</TableCell>
                             <TableCell className="align-top py-3">{item.intervalMonths}</TableCell>
                             <TableCell className="align-top py-3">${item.costRange[0]} - ${item.costRange[1]}</TableCell>
                             <TableCell className="align-top py-3">${item.oemCostRange[0]} - ${item.oemCostRange[1]}</TableCell>
                             <TableCell className="text-sm text-muted-foreground align-top py-3 leading-relaxed">{item.riskNote}</TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                    </Table>
                  </div>
                </CardContent>
             </Card>
          </div>
        );

      case 'unscheduled':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Unscheduled Maintenance Forecast</h2>
              <Button variant="destructive" size="sm" className="opacity-80 hover:opacity-100">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Section
              </Button>
            </div>
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <div className="rounded-md border overflow-hidden">
                 <Table>
                   <TableHeader className="bg-[#1e60b0] hover:bg-[#1e60b0]">
                     <TableRow className="hover:bg-[#1e60b0] border-b-0">
                       <TableHead className="text-white font-bold h-10 w-[20%]">Item</TableHead>
                       <TableHead className="text-white font-bold h-10 w-[15%]">Forecast Mileage</TableHead>
                       <TableHead className="text-white font-bold h-10 w-[10%]">Probability</TableHead>
                       <TableHead className="text-white font-bold h-10 w-[15%]">Cost Range</TableHead>
                       <TableHead className="text-white font-bold h-10 w-[10%]">OEM Cost</TableHead>
                       <TableHead className="text-white font-bold h-10 w-[30%]">Description</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {vehicle.unscheduledForecast.map((item, i) => (
                       <TableRow key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-muted/10"}>
                         <TableCell className="font-medium align-top py-3">{item.name}</TableCell>
                         <TableCell className="align-top py-3">{(item.windowMin/1000).toFixed(0)},000-{(item.windowMax/1000).toFixed(0)},000</TableCell>
                         <TableCell className="align-top py-3">{(item.probability * 100).toFixed(0)}%</TableCell>
                         <TableCell className="align-top py-3">${item.costMin}-${item.costMax}</TableCell>
                         <TableCell className="align-top py-3">${item.oemCostMin}-${item.oemCostMax}</TableCell>
                         <TableCell className="text-sm text-muted-foreground align-top py-3 leading-relaxed">{item.description}</TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'gap':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Maintenance Gap Analysis</h2>
              <Button variant="destructive" size="sm" className="opacity-80 hover:opacity-100">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Section
              </Button>
            </div>
            
            <Alert className="bg-blue-50/50 border-l-4 border-l-[#1e60b0] border-y border-r border-slate-200">
               <AlertDescription className="text-slate-700 font-medium">
                  Summary: Analyzed <strong>{vehicle.gapAnalysis.totalItems}</strong> maintenance items. Found <strong>{vehicle.gapAnalysis.overdue} overdue</strong>, <strong>{vehicle.gapAnalysis.dueNow} due now</strong>, and <strong>{vehicle.gapAnalysis.dueSoon} due in the near future</strong>.
               </AlertDescription>
            </Alert>

            <div className="bg-slate-50 p-4 border rounded-md mb-2">
               <h3 className="font-bold text-lg mb-1">All Routine Maintenance Items ({vehicle.gapAnalysis.totalItems})</h3>
               <p className="text-muted-foreground text-sm">Complete status of all routine maintenance items based on service history comparison.</p>
            </div>

            <Card className="border-0 shadow-none">
               <CardContent className="p-0">
                 <div className="rounded-md border overflow-hidden">
                   <Table>
                     <TableHeader className="bg-[#1e60b0] hover:bg-[#1e60b0]">
                       <TableRow className="hover:bg-[#1e60b0] border-b-0">
                         <TableHead className="text-white font-bold h-10 w-[15%]">Item</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[10%]">Status</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[12%]">Status Details</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[12%]">Last Performed</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[10%]">Interval</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[10%]">Next Due</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[8%]">Severity</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[15%]">Risk Note</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[8%]">Cost Range</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[8%]">OEM Cost</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {vehicle.gapAnalysis.items.map((item, i) => (
                         <TableRow key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-muted/10"}>
                           <TableCell className="font-bold align-top py-3">{item.item}</TableCell>
                           <TableCell className="align-top py-3">
                             <Badge variant="outline" className={`
                               uppercase text-[10px] font-bold rounded-sm px-1.5 py-0.5 border-0 text-white
                               ${item.status === 'dueSoon' ? 'bg-[#3b82f6]' : item.status === 'notDue' ? 'bg-[#22c55e]' : 'bg-red-500'}
                             `}>
                               {item.status === 'dueSoon' ? 'NEAR FUTURE' : item.status === 'notDue' ? 'NOT DUE' : 'OVERDUE'}
                             </Badge>
                           </TableCell>
                           <TableCell className="text-xs align-top py-3">{item.statusDetails || '-'}</TableCell>
                           <TableCell className="text-xs align-top py-3">{item.lastPerformed}</TableCell>
                           <TableCell className="text-xs align-top py-3">{item.intervalMiles.toLocaleString()} miles / {item.intervalMonths} months</TableCell>
                           <TableCell className="text-xs align-top py-3">{item.nextDue}</TableCell>
                           <TableCell className="text-xs align-top py-3">{item.severity || 'N/A'}</TableCell>
                           <TableCell className="text-xs align-top py-3">{item.riskNote}</TableCell>
                           <TableCell className="text-xs align-top py-3">${item.costRange[0]} - ${item.costRange[1]}</TableCell>
                           <TableCell className="text-xs align-top py-3 text-muted-foreground">${item.oemCostRange[0]} - ${item.oemCostRange[1]}</TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>
               </CardContent>
            </Card>
          </div>
        );
      
      case 'risk':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">All Unscheduled Maintenance Items ({vehicle.risks.length} items)</h2>
            <p className="text-muted-foreground">Complete risk evaluation of all unscheduled maintenance items based on service history, mileage, and maintenance quality.</p>
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                 <div className="rounded-md border overflow-hidden">
                   <Table>
                     <TableHeader className="bg-[#1e60b0] hover:bg-[#1e60b0]">
                       <TableRow className="hover:bg-[#1e60b0] border-b-0">
                         <TableHead className="text-white font-bold h-10 w-[15%]">Item</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[10%]">Forecast Mileage</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[8%]">Probability</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[8%]">Risk Level</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[8%]">Risk Score</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[8%]">Already Fixed?</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[8%]">Mileage Risk</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[10%]">Miles Until Failure</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[8%]">Maintenance Quality</TableHead>
                         <TableHead className="text-white font-bold h-10 w-[17%]">Recommendation</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {vehicle.risks.map((risk, i) => (
                         <TableRow key={risk.id} className={i % 2 === 0 ? "bg-white" : "bg-muted/10"}>
                           <TableCell className="font-bold align-top py-3">{risk.name}</TableCell>
                           <TableCell className="align-top py-3 text-xs">{(risk.windowMin!/1000).toFixed(0)},000-{(risk.windowMax!/1000).toFixed(0)},000</TableCell>
                           <TableCell className="align-top py-3">{(risk.probability * 100).toFixed(0)}%</TableCell>
                           <TableCell className="align-top py-3">
                             <Badge className={`
                               border-0 rounded-sm font-bold text-xs px-2
                               ${risk.riskLevel === 'High' ? 'bg-red-500 hover:bg-red-600 text-white' : 
                                 risk.riskLevel === 'Moderate' ? 'bg-amber-400 hover:bg-amber-500 text-black' : 
                                 'bg-emerald-500 hover:bg-emerald-600 text-white'}
                             `}>
                               {risk.riskLevel.toUpperCase()}
                             </Badge>
                           </TableCell>
                           <TableCell className="text-amber-500 font-bold align-top py-3">{risk.riskScore}</TableCell>
                           <TableCell className="align-top py-3">{risk.alreadyFixed ? 'Yes' : 'No'}</TableCell>
                           <TableCell className="align-top py-3 text-sm">{risk.mileageRisk}</TableCell>
                           <TableCell className="align-top py-3 text-xs">{risk.milesUntilFailureBucket}</TableCell>
                           <TableCell className="align-top py-3 text-sm">{risk.maintenanceQuality}</TableCell>
                           <TableCell className="align-top py-3 text-xs leading-relaxed">{risk.recommendation || '-'}</TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'market':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Market Valuation</h2>
            <Card>
              <CardHeader><CardTitle>Current Market Valuation</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                 <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                   <div className="text-sm font-bold uppercase text-muted-foreground mb-2">Retail Value</div>
                   <div className="text-3xl font-bold text-primary mb-1">${vehicle.valuation.retail.toLocaleString()}</div>
                   <div className="text-xs text-muted-foreground line-through decoration-slate-400 opacity-50 mb-1">$38,000</div>
                   <div className="text-xs text-muted-foreground">Dealer/Retail Price</div>
                 </div>
                 <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                   <div className="text-sm font-bold uppercase text-muted-foreground mb-2">Private Party Value</div>
                   <div className="text-3xl font-bold text-primary mb-1">${vehicle.valuation.privateParty.toLocaleString()}</div>
                   <div className="text-xs text-muted-foreground line-through decoration-slate-400 opacity-50 mb-1">$35,000</div>
                   <div className="text-xs text-muted-foreground">Private Sale Price</div>
                 </div>
                 <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                   <div className="text-sm font-bold uppercase text-muted-foreground mb-2">Trade-In Value</div>
                   <div className="text-3xl font-bold text-primary mb-1">${vehicle.valuation.tradeIn.toLocaleString()}</div>
                   <div className="text-xs text-muted-foreground line-through decoration-slate-400 opacity-50 mb-1">$30,000</div>
                   <div className="text-xs text-muted-foreground">Trade-In Value</div>
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Depreciation Analysis</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                   <div className="border-l-4 border-primary pl-4">
                     <div className="text-muted-foreground mb-1">Original MSRP</div>
                     <div className="font-bold text-lg">${vehicle.valuation.depreciationStats.msrp.toLocaleString()}</div>
                   </div>
                   <div className="border-l-4 border-primary pl-4">
                     <div className="text-muted-foreground mb-1">Total Depreciation</div>
                     <div className="font-bold text-lg">${vehicle.valuation.depreciationStats.totalDepreciation.toLocaleString()} ({vehicle.valuation.depreciationStats.totalDepreciationPct}%)</div>
                   </div>
                    <div className="border-l-4 border-primary pl-4">
                     <div className="text-muted-foreground mb-1">Annual Depreciation Rate</div>
                     <div className="font-bold text-lg">{vehicle.valuation.depreciationStats.annualRate}%</div>
                   </div>
                   <div className="border-l-4 border-primary pl-4">
                     <div className="text-muted-foreground mb-1">Value Retention</div>
                     <div className="font-bold text-lg">{vehicle.valuation.depreciationStats.valueRetention}%</div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'tco':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Total Cost of Ownership</h2>
             <Card>
              <CardContent className="pt-6">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                     <div>
                       <div className="text-muted-foreground text-xs uppercase mb-1">Depreciation</div>
                       <div className="text-xl font-bold font-mono">${vehicle.tco.depreciationLoss.toLocaleString()}</div>
                     </div>
                     <div>
                       <div className="text-muted-foreground text-xs uppercase mb-1">Projected Routine</div>
                       <div className="text-xl font-bold font-mono">${vehicle.tco.routineMaintenanceCost.toLocaleString()}</div>
                     </div>
                     <div>
                       <div className="text-muted-foreground text-xs uppercase mb-1">Immediate Burden</div>
                       <div className="text-xl font-bold font-mono">${vehicle.tco.immediateCostBurden.toLocaleString()}</div>
                     </div>
                     <div className="border-l pl-6">
                       <div className="text-primary font-bold text-xs uppercase mb-1">Total Costs (3yr)</div>
                       <div className="text-2xl font-bold font-mono text-primary">${vehicle.tco.totalCost.toLocaleString()}</div>
                     </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-20">
            <Info className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Select a module from the sidebar to verify data.</h3>
          </div>
        );
    }
  };

  return (
    <Layout mode="demo">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-muted rounded-md overflow-hidden">
                <img src={vehicle.imageUrl} className="w-full h-full object-cover" alt="" />
             </div>
             <div>
                <h1 className="text-xl font-bold font-heading">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <span>{vehicle.trim}</span>
                   <span>•</span>
                   <span>{vehicle.mileage.toLocaleString()} miles</span>
                </div>
             </div>
          </div>
          <Button onClick={() => setLocation(`/report/${vehicle.id}`)} className="bg-primary hover:bg-primary/90">
            Show Comparator <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {renderSection()}
      </div>
    </Layout>
  );
}
