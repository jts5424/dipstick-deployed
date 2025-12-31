
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Wrench, 
  FileText, 
  DollarSign, 
  TrendingDown, 
  Activity,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Info
} from "lucide-react";

export interface ServiceRecord {
  id: string;
  date: string;
  mileage: number | null;
  category: 'admin' | 'maintenance' | 'inspection' | 'repair' | 'tire';
  description: string;
  location: string;
  costEstimate?: number;
}

export interface MaintenanceItem {
  id: string;
  item: string;
  intervalMiles: number;
  intervalMonths: number;
  costRange: [number, number];
  oemCostRange: [number, number];
  description?: string;
  status?: 'overdue' | 'dueSoon' | 'notDue' | 'dueNow';
  statusDetails?: string;
  lastPerformed?: string;
  lastDoneMiles?: number;
  nextDue?: string;
  riskNote?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical' | 'N/A';
}

export interface UnscheduledItem {
  id: string;
  name: string;
  windowMin: number;
  windowMax: number;
  probability: number;
  costMin: number;
  costMax: number;
  oemCostMin: number;
  oemCostMax: number;
  description?: string;
}

export interface RiskItem {
  id: string;
  name: string;
  windowMin?: number;
  windowMax?: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskScore: number;
  probability: number;
  costMin?: number;
  costMax?: number;
  alreadyFixed: boolean;
  mileageRisk?: string;
  milesUntilFailureBucket?: string;
  maintenanceQuality?: string;
  evidenceTags: string[];
  recommendation?: string;
}

export interface LeverageItem {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High';
  costMin: number;
  costMax: number;
  negotiationAngle: string;
  questionsToAsk: string[];
  evidenceTags: string[];
  selected?: boolean;
}

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  vin: string;
  engine: string;
  drivetrain?: string;
  location?: string;
  imageUrl?: string;
  parseSuccessMessage?: string;

  valuation: {
    retail: number;
    retailRange: [number, number];
    privateParty: number;
    privateRange: [number, number];
    tradeIn: number;
    tradeRange: [number, number];
    depreciationCurve: { mileage: number; retailValue: number; privateValue: number }[];
    projectedFutureValues: { year1: {retail: number, private: number}; year2: {retail: number, private: number}; year3: {retail: number, private: number}; year5: {retail: number, private: number} };
    depreciationStats: {
      msrp: number;
      totalDepreciation: number;
      totalDepreciationPct: number;
      annualRate: number;
      valueRetention: number;
      mileageImpact: string;
      phase: string;
      vsAverage: string;
      marketCondition: string;
      marketTrend: string;
      marketSegment: string;
    };
  };

  tco: {
    years: number;
    milesPerYear: number;
    askingPrice: number;
    immediateCostBurden: number;
    routineMaintenanceCost: number;
    expectedUnscheduledRepairCost: number;
    depreciationLoss: number; // Value loss over ownership period
    totalCost: number; // Total operating cost + depreciation
    expectedSalePrice: number;
    totalLoss: number; // Similar to totalCost, often used interchangeably in simplified views
    breakdown: { name: string; value: number }[];
    c12?: number; // Cost 12 months? from demo
    eurc?: number; // Expected Unscheduled Repair Cost?
  };

  scores: {
    dipstickScore: number;
    dealScore: number; // 0-100
    conditionScore: number; // 0-100
    riskLevel: 'Low' | 'Moderate' | 'High';
    counts: { high: number; moderate: number; low: number; critical: number; fixed: number };
  };

  serviceRecords: ServiceRecord[];
  
  expertAnalysis: {
    overallEvaluation?: string;
    confidenceScore?: 'High' | 'Medium' | 'Low';
    confidenceReason?: string;
    gaps: { text: string; concern: 'Low' | 'Medium' | 'High' }[];
    inconsistentMileage: { text: string; concern: 'Low' | 'Medium' | 'High' }[];
    servicesPerformedMoreThanNormal: string[];
    expertNotes: string[];
    anomalies: string[]; // Keep for compatibility
    concerns: string[]; // Keep for compatibility
    positiveFindings: string[]; // Keep for compatibility
  };

  routineMaintenanceSchedule: MaintenanceItem[];
  unscheduledForecast: UnscheduledItem[];
  gapAnalysis: {
    totalItems: number;
    overdue: number;
    dueNow: number;
    dueSoon: number;
    items: MaintenanceItem[];
  };
  risks: RiskItem[];
  leverageItems: LeverageItem[];
  recalls?: {
    id: string;
    campaignNumber: string;
    component: string;
    summary: string;
    consequence: string;
    remedy: string;
    status: 'Open' | 'Closed' | 'Fixed';
    date: string;
  }[];
}

// --- MOCK DATA FOR DEMO ---

export const vehicles: Vehicle[] = [
  {
    id: "audi-s7-2015",
    year: 2015,
    make: "Audi",
    model: "S7",
    trim: "4.0T QUATTRO",
    engine: "4.0L V8 F DOHC 32V",
    vin: "WAUW2AFC9FN008411",
    mileage: 72300,
    drivetrain: "AWD",
    location: "Chagrin Falls, OH", // Infer from history
    imageUrl: "/stock_images/2015_audi_s7_silver__f2ab32c6.jpg",
    parseSuccessMessage: "PDF parsed successfully! 44 service records found. Vehicle info auto-populated above. Please verify and edit if needed.",

    recalls: [
      {
        id: "r1",
        campaignNumber: "22V-155",
        component: "TURBOCHARGER OIL STRAINER MESH",
        summary: "The oil strainer mesh within the turbocharger oil supply line may become blocked with oil deposits, which can lead to turbocharger failure.",
        consequence: "Turbocharger failure can lead to a loss of engine power, increasing the risk of a crash.",
        remedy: "Dealers will replace the oil strainer mesh and change the oil and filter.",
        status: "Open",
        date: "2022-03-10"
      }
    ],

    valuation: {
      retail: 35500,
      retailRange: [33000, 38000],
      privateParty: 32500,
      privateRange: [30000, 35000],
      tradeIn: 27500,
      tradeRange: [25000, 30000],
      depreciationCurve: [
        { mileage: 30000, retailValue: 62000, privateValue: 60000 }, // Tooltip example
        { mileage: 40000, retailValue: 55000, privateValue: 52000 }, // Knee
        { mileage: 72300, retailValue: 35500, privateValue: 32500 }, // Current
        { mileage: 82300, retailValue: 34000, privateValue: 31000 },
        { mileage: 92300, retailValue: 32000, privateValue: 29000 },
        { mileage: 108300, retailValue: 27000, privateValue: 24000 }, // Approx 3 years @ 12k/yr
      ],
      projectedFutureValues: {
        year1: { retail: 34000, private: 31000 },
        year2: { retail: 32000, private: 29000 },
        year3: { retail: 30000, private: 27000 },
        year5: { retail: 27000, private: 24000 }
      },
      depreciationStats: {
        msrp: 82000,
        totalDepreciation: 46500,
        totalDepreciationPct: 56.1,
        annualRate: 5.6,
        valueRetention: 43.3,
        mileageImpact: "Average",
        phase: "Mid depreciation phase",
        vsAverage: "At average",
        marketCondition: "Stable",
        marketTrend: "Stable",
        marketSegment: "Luxury"
      }
    },

    tco: {
      years: 3,
      milesPerYear: 12000,
      askingPrice: 25000,
      immediateCostBurden: 35,
      routineMaintenanceCost: 3140,
      expectedUnscheduledRepairCost: 0,
      depreciationLoss: 5500,
      totalCost: 8675,
      expectedSalePrice: 27000,
      totalLoss: 6675, // $8675 cost - $27000 sale + $25000 purchase = $6675
      c12: 35,
      eurc: 0,
      breakdown: [
        { name: "Depreciation", value: 5500 },
        { name: "Routine Maint.", value: 3140 },
        { name: "Immediate Fixes", value: 35 },
        { name: "Unscheduled", value: 0 }
      ]
    },

    scores: {
      dipstickScore: 81,
      dealScore: 92,
      conditionScore: 81,
      riskLevel: "Low",
      counts: { high: 4, moderate: 21, low: 0, critical: 0, fixed: 1 }
    },

    serviceRecords: [
      { id: "s1", date: "2014-08-30", mileage: null, category: "admin", description: "Vehicle manufactured and shipped to original dealer", location: "-" },
      { id: "s2", date: "2014-08-30", mileage: null, category: "admin", description: "Vehicle purchase reported", location: "Ohio Motor Vehicle Dept." },
      { id: "s3", date: "2014-09-11", mileage: null, category: "admin", description: "Title issued or updated, Registration issued or renewed, First owner reported", location: "Chagrin Falls, OH" },
      { id: "s4", date: "2014-11-26", mileage: null, category: "admin", description: "Registration issued or renewed", location: "Chagrin Falls, OH" },
      { id: "s5", date: "2015-01-21", mileage: 5364, category: "maintenance", description: "5,000 mile service performed", location: "Audi of Bedford" },
      { id: "s6", date: "2015-05-14", mileage: 7457, category: "tire", description: "Tire condition and pressure checked", location: "Audi of Bedford" },
      { id: "s7", date: "2015-11-23", mileage: 11795, category: "inspection", description: "Maintenance inspection completed, Tire condition and pressure checked", location: "Audi of Bedford" },
      // ... Assuming more records to reach 44 total ...
      { id: "s8", date: "2016-02-09", mileage: 13180, category: "maintenance", description: "Maintenance inspection completed, 15,000 mile service performed", location: "Audi of Bedford" },
      { id: "s9", date: "2016-04-15", mileage: 14464, category: "tire", description: "Tire condition and pressure checked", location: "Audi of Bedford" },
      { id: "s10", date: "2016-06-01", mileage: 14918, category: "tire", description: "Tire condition and pressure checked", location: "Audi of Bedford" },
      { id: "s11", date: "2016-07-26", mileage: 15918, category: "inspection", description: "A/C and heating system checked, Interior trim checked", location: "Audi of Bedford" },
      { id: "s12", date: "2016-12-09", mileage: 19640, category: "tire", description: "Tire condition and pressure checked", location: "Audi of Bedford" },
      { id: "s13", date: "2016-12-28", mileage: 20180, category: "maintenance", description: "Maintenance inspection completed", location: "Audi of Bedford" },
      { id: "s14", date: "2017-01-12", mileage: 20418, category: "maintenance", description: "25,000 mile service performed", location: "Audi of Bedford" },
      { id: "s15", date: "2017-06-05", mileage: 25100, category: "maintenance", description: "Oil and filter changed", location: "Audi of Bedford" },
      { id: "s16", date: "2017-10-20", mileage: 28450, category: "inspection", description: "Maintenance inspection completed", location: "Audi of Bedford" },
      { id: "s17", date: "2018-03-14", mileage: 32600, category: "maintenance", description: "35,000 mile service performed, Brake fluid flushed", location: "Audi of Bedford" },
      { id: "s18", date: "2018-08-30", mileage: 36800, category: "tire", description: "Tires replaced, Wheel alignment performed", location: "Audi of Bedford" },
      { id: "s19", date: "2018-12-15", mileage: 39500, category: "maintenance", description: "Oil and filter changed", location: "Audi of Bedford" },
      { id: "s20", date: "2019-01-10", mileage: null, category: "admin", description: "Registration issued or renewed", location: "Chagrin Falls, OH" },
      // GAPS 2019-2022
      { id: "s24", date: "2023-01-05", mileage: 60100, category: "maintenance", description: "60,000 mile service performed", location: "Audi of Bedford" },
      { id: "s25", date: "2023-04-12", mileage: 62400, category: "inspection", description: "Maintenance inspection completed", location: "Audi of Bedford" },
      { id: "s26", date: "2023-08-20", mileage: 65200, category: "maintenance", description: "Oil and filter changed", location: "Independent Shop" },
      { id: "s27", date: "2023-11-15", mileage: 67100, category: "tire", description: "Tire rotation", location: "Independent Shop" },
      { id: "s28", date: "2024-02-10", mileage: 68578, category: "maintenance", description: "Coolant flushed", location: "Service Center" },
      { id: "s29", date: "2024-05-22", mileage: 69800, category: "inspection", description: "Pre-trip inspection", location: "Independent Shop" },
      { id: "s30", date: "2024-09-01", mileage: 71000, category: "maintenance", description: "Oil and filter changed", location: "Independent Shop" },
      { id: "s31", date: "2024-10-15", mileage: 71500, category: "repair", description: "Wiper blades replaced", location: "AutoZone" },
      { id: "s32", date: "2024-11-20", mileage: 72000, category: "inspection", description: "Vehicle serviced", location: "Independent Shop" },
      { id: "s33", date: "2024-12-05", mileage: 72100, category: "admin", description: "Vehicle offered for sale", location: "Dealer" },
      { id: "s34", date: "2025-01-10", mileage: 72150, category: "inspection", description: "Pre-delivery inspection", location: "Dealer" },
      { id: "s35", date: "2025-02-15", mileage: 72200, category: "admin", description: "Title updated", location: "DMV" },
      { id: "s_last", date: "2025-10-13", mileage: 72300, category: "maintenance", description: "Oil and filter changed", location: "Independent Shop" },
    ],

    expertAnalysis: {
      overallEvaluation: "This Audi S7 presents a classic high-performance luxury dilemma: strong cosmetics masking specific deferred maintenance liabilities. While the 'Clean' title and recent oil changes build surface confidence, our analysis flags 2 critical service gaps (2019-2022) and multiple 'Tire Check' entries that typically mask suspension alignment issues. You have $2,400 in hidden leverage here—don't pay retail for someone else's skipped intervals.",
      confidenceScore: "Medium",
      confidenceReason: "2 significant service gaps; 15% of records missing mileage",
      gaps: [{ text: "There are significant gaps in service records, particularly between 2019 and 2022, which raises concerns about the vehicle's maintenance during that period.\nConcern: Medium concern as it indicates potential neglect of critical maintenance.", concern: "Medium" }],
      inconsistentMileage: [{ text: "Several service records do not include mileage, making it difficult to assess the frequency and timing of maintenance accurately.\nConcern: High concern as it obscures the vehicle's maintenance timeline.", concern: "High" }],
      servicesPerformedMoreThanNormal: ["Tire condition and pressure checks\nFrequency: Performed 10 times over 9 years | Normal: Typically every 5,000 to 10,000 miles or seasonally\nInterpretation: The high frequency may indicate ongoing issues with tire wear or alignment problems, which is a concern."],
      expertNotes: [
        "Maintenance Quality: While the vehicle has undergone regular inspections, the lack of documented mileage for many services makes it difficult to evaluate the thoroughness of maintenance.",
        "Recurring Issues: The frequency of tire services may indicate underlying issues with the vehicle's suspension or alignment that should be investigated.",
        "Missing Services: Critical services such as brake fluid changes and transmission fluid checks appear to be absent from the records, which are important for high-performance vehicles."
      ],
      anomalies: ["Significant gaps in service records (2019-2022)", "Repeated tire checks (10x in 9 years)"],
      concerns: ["Gaps in service history", "Inconsistent mileage reporting"],
      positiveFindings: [
        "Regular oil changes detected recently", 
        "Clean title history",
        "Major 60,000 mile service performed on schedule",
        "Brake pads replaced recently (2022)",
        "Tires rotated consistently"
      ]
    },

    routineMaintenanceSchedule: [
      { id: "rm1", item: "Oil Change", intervalMiles: 10000, intervalMonths: 12, costRange: [100, 200], oemCostRange: [150, 300], description: "Replace engine oil and oil filter", riskNote: "Engine sludge is the silent killer of resale value. Miss this and you're funding the next owner's rebuild." },
      { id: "rm2", item: "Air Filter Replacement", intervalMiles: 20000, intervalMonths: 24, costRange: [30, 60], oemCostRange: [50, 100], description: "Replace engine air filter", riskNote: "Choked airflow equals wasted fuel dollars. Don't pay for gas you're not burning." },
      { id: "rm3", item: "Cabin Air Filter", intervalMiles: 20000, intervalMonths: 24, costRange: [30, 50], oemCostRange: [50, 80], description: "Replace cabin air filter", riskNote: "Mold spores in your AC system? Hard pass. Negotiate this immediately." },
      { id: "rm4", item: "Fuel Filter", intervalMiles: 40000, intervalMonths: 48, costRange: [100, 150], oemCostRange: [150, 250], description: "Replace fuel filter", riskNote: "A clogged filter forces the fuel pump to work overtime until it burns out." },
      { id: "rm5", item: "Transmission Fluid Change", intervalMiles: 40000, intervalMonths: 48, costRange: [150, 300], oemCostRange: [250, 400], description: "Replace transmission fluid", riskNote: "Lifetime fluid is a myth. Change it or budget $4k for a new gearbox." },
      { id: "rm6", item: "Brake Fluid Flush", intervalMiles: 20000, intervalMonths: 24, costRange: [70, 120], oemCostRange: [100, 180], description: "Flush brake fluid", riskNote: "Water in brake lines boils under stress. That means no brakes when you need them." },
      { id: "rm7", item: "Coolant Change", intervalMiles: 40000, intervalMonths: 48, costRange: [100, 150], oemCostRange: [150, 250], description: "Replace engine coolant", riskNote: "Acidic coolant eats gaskets from the inside out. Cheap flush vs. expensive head gasket job." },
      { id: "rm8", item: "Power Steering Fluid", intervalMiles: 40000, intervalMonths: 48, costRange: [50, 100], oemCostRange: [80, 150], description: "Replace power steering fluid", riskNote: "Whining pump? That's the sound of metal shavings destroying your steering rack." },
      { id: "rm9", item: "Spark Plug Replacement", intervalMiles: 60000, intervalMonths: 72, costRange: [200, 400], oemCostRange: [300, 500], description: "Replace spark plugs", riskNote: "Misfires dump raw fuel into the catalytic converter. $20 plugs save a $2,000 cat." },
      { id: "rm10", item: "Belt Replacement", intervalMiles: 60000, intervalMonths: 72, costRange: [300, 600], oemCostRange: [500, 800], description: "Replace belts", riskNote: "When this snaps, you lose power steering, alternator, and cooling instantly. Game over." },
    ],

    unscheduledForecast: [
      { 
        id: "uf1", 
        name: "Timing Chain Tensioner", 
        windowMin: 60000, 
        windowMax: 100000, 
        probability: 0.30, 
        costMin: 300, 
        costMax: 600, 
        oemCostMin: 500, 
        oemCostMax: 900,
        description: "Can fail due to wear."
      },
      { 
        id: "uf2", 
        name: "Water Pump", 
        windowMin: 70000, 
        windowMax: 120000, 
        probability: 0.25, 
        costMin: 400, 
        costMax: 800, 
        oemCostMin: 600, 
        oemCostMax: 1000,
        description: "May develop leaks."
      },
      { 
        id: "uf3", 
        name: "Oil Leaks (Valve Cover Gaskets)", 
        windowMin: 50000, 
        windowMax: 90000, 
        probability: 0.40, 
        costMin: 200, 
        costMax: 400, 
        oemCostMin: 300, 
        oemCostMax: 600,
        description: "Can degrade over time."
      },
      { 
        id: "uf4", 
        name: "Oil Cooler", 
        windowMin: 80000, 
        windowMax: 120000, 
        probability: 0.20, 
        costMin: 500, 
        costMax: 900, 
        oemCostMin: 700, 
        oemCostMax: 1100,
        description: "Can develop leaks."
      },
      { 
        id: "uf5", 
        name: "Fuel Pump", 
        windowMin: 60000, 
        windowMax: 100000, 
        probability: 0.15, 
        costMin: 300, 
        costMax: 600, 
        oemCostMin: 500, 
        oemCostMax: 800,
        description: "May fail due to wear."
      },
      { 
        id: "uf6", 
        name: "Transmission Solenoids", 
        windowMin: 70000, 
        windowMax: 120000, 
        probability: 0.20, 
        costMin: 200, 
        costMax: 400, 
        oemCostMin: 300, 
        oemCostMax: 600,
        description: "Can fail causing shifting issues."
      },
      { 
        id: "uf7", 
        name: "Brake Calipers", 
        windowMin: 50000, 
        windowMax: 100000, 
        probability: 0.25, 
        costMin: 250, 
        costMax: 500, 
        oemCostMin: 400, 
        oemCostMax: 700,
        description: "Can seize or leak."
      },
      { 
        id: "uf8", 
        name: "Alternator", 
        windowMin: 80000, 
        windowMax: 120000, 
        probability: 0.20, 
        costMin: 300, 
        costMax: 600, 
        oemCostMin: 500, 
        oemCostMax: 900,
        description: "May fail due to wear."
      },
    ],

    gapAnalysis: {
      totalItems: 13,
      overdue: 1,
      dueNow: 0,
      dueSoon: 4,
      items: [
        { 
          id: "ga1", 
          item: "Oil Change", 
          status: "dueSoon", 
          statusDetails: "Due in 10,000 miles / 10 months",
          lastPerformed: "72,300 miles (2025-10-13)", 
          nextDue: "82,300 miles (2026-10-13)", 
          intervalMiles: 10000, 
          intervalMonths: 12, 
          costRange: [100, 200], 
          oemCostRange: [150, 300], 
          riskNote: "Skipping oil changes can lead to engine wear, overheating, and eventual engine failure.",
          severity: "N/A"
        },
        { 
          id: "ga2", 
          item: "Air Filter Replacement", 
          status: "notDue", 
          statusDetails: "Not due",
          lastPerformed: "Never", 
          nextDue: "79,200 miles (2026-06-09)", 
          intervalMiles: 20000, 
          intervalMonths: 24, 
          costRange: [30, 60], 
          oemCostRange: [50, 100], 
          riskNote: "A clogged air filter can reduce engine efficiency and power, leading to increased fuel consumption.",
          severity: "N/A"
        },
        { 
          id: "ga3", 
          item: "Cabin Air Filter Replacement", 
          status: "notDue", 
          statusDetails: "Not due",
          lastPerformed: "Never", 
          nextDue: "79,200 miles (2026-10-09)", 
          intervalMiles: 20000, 
          intervalMonths: 24, 
          costRange: [30, 50], 
          oemCostRange: [50, 80], 
          riskNote: "Neglecting this can lead to poor air quality inside the cabin and reduced HVAC efficiency.",
          severity: "N/A"
        },
        { 
          id: "ga4", 
          item: "Fuel Filter Replacement", 
          status: "notDue", 
          statusDetails: "Not due",
          lastPerformed: "Never", 
          nextDue: "112,300 miles (2029-12-24)", 
          intervalMiles: 40000, 
          intervalMonths: 48, 
          costRange: [100, 150], 
          oemCostRange: [150, 250], 
          riskNote: "A clogged fuel filter can cause engine misfires, reduced power, and potential fuel pump damage.",
          severity: "N/A"
        },
        { 
          id: "ga5", 
          item: "Transmission Fluid Change", 
          status: "notDue", 
          statusDetails: "Not due",
          lastPerformed: "Never", 
          nextDue: "112,300 miles (2029-12-24)", 
          intervalMiles: 40000, 
          intervalMonths: 48, 
          costRange: [150, 300], 
          oemCostRange: [250, 400], 
          riskNote: "Neglecting this can lead to transmission overheating, slipping, and eventual failure.",
          severity: "N/A"
        },
        { 
          id: "ga6", 
          item: "Brake Fluid Flush", 
          status: "notDue", 
          statusDetails: "Not due",
          lastPerformed: "Never", 
          nextDue: "79,200 miles (2026-10-09)", 
          intervalMiles: 20000, 
          intervalMonths: 24, 
          costRange: [70, 120], 
          oemCostRange: [100, 180], 
          riskNote: "Old brake fluid can absorb moisture, leading to brake failure and reduced stopping power.",
          severity: "N/A"
        },
        { 
          id: "ga7", 
          item: "Coolant Change", 
          status: "dueSoon", 
          statusDetails: "Due in 10,000 miles / 12 months",
          lastPerformed: "68,578 miles (2024-11-01)", 
          nextDue: "108,578 miles (2028-11-01)", 
          intervalMiles: 40000, 
          intervalMonths: 48, 
          costRange: [100, 150], 
          oemCostRange: [150, 250], 
          riskNote: "Old coolant can lead to engine overheating and damage due to corrosion and scale buildup.",
          severity: "N/A"
        },
        { 
          id: "ga8", 
          item: "Power Steering Fluid Change", 
          status: "notDue", 
          statusDetails: "Not due",
          lastPerformed: "Never", 
          nextDue: "112,300 miles (2029-12-24)", 
          intervalMiles: 40000, 
          intervalMonths: 48, 
          costRange: [50, 100], 
          oemCostRange: [80, 150], 
          riskNote: "Neglecting this can lead to steering difficulties and potential power steering pump failure.",
          severity: "N/A"
        },
        { 
          id: "ga9", 
          item: "Spark Plug Replacement", 
          status: "notDue", 
          statusDetails: "Not due",
          lastPerformed: "Never", 
          nextDue: "78,000 miles (2026-12-24)", 
          intervalMiles: 60000, 
          intervalMonths: 72, 
          costRange: [200, 400], 
          oemCostRange: [300, 500], 
          riskNote: "Worn spark plugs can cause misfires, reduced power, and increased emissions.",
          severity: "N/A"
        },
        { 
          id: "ga10", 
          item: "Belt Replacement (Serpentine/Timing)", 
          status: "dueSoon", 
          statusDetails: "Due in 6,000 miles / 12 months",
          lastPerformed: "72,300 miles", 
          nextDue: "78,300 miles (2026-09-09)", 
          intervalMiles: 60000, 
          intervalMonths: 72, 
          costRange: [300, 600], 
          oemCostRange: [500, 800], 
          riskNote: "A broken belt can lead to severe engine damage and costly repairs.",
          severity: "N/A"
        }
      ]
    },

    risks: [
      { 
        id: "r1", 
        name: "Timing Chain Tensioner", 
        riskLevel: "Moderate", 
        riskScore: 65, 
        probability: 0.30, 
        windowMin: 60000, 
        windowMax: 100000, 
        costMin: 300, 
        costMax: 600, 
        alreadyFixed: false, 
        mileageRisk: "Past typical failure", 
        milesUntilFailureBucket: "Past by 12,300 miles", 
        maintenanceQuality: "Fair", 
        evidenceTags: ["Risk: Moderate"],
        recommendation: "It is recommended to have the timing chain tensioner inspected and potentially replaced to mitigate the risk of failure, especially given the current mileage and lack of specific maintenance records."
      },
      { 
        id: "r2", 
        name: "Water Pump", 
        riskLevel: "Moderate", 
        riskScore: 60, 
        probability: 0.25, 
        windowMin: 70000, 
        windowMax: 120000, 
        costMin: 400, 
        costMax: 800, 
        alreadyFixed: false, 
        mileageRisk: "At risk", 
        milesUntilFailureBucket: "Past by 2,300 miles", 
        maintenanceQuality: "Fair", 
        evidenceTags: ["Risk: Moderate"],
        recommendation: "It is advisable to monitor the water pump closely or consider a preventative replacement or inspection, especially given the vehicle's current mileage and the potential for failure."
      },
      { 
        id: "r3", 
        name: "Oil Leaks (Valve Cover Gaskets)", 
        riskLevel: "High", 
        riskScore: 75, 
        probability: 0.40, 
        windowMin: 50000, 
        windowMax: 90000, 
        costMin: 200, 
        costMax: 400, 
        alreadyFixed: false, 
        mileageRisk: "At risk", 
        milesUntilFailureBucket: "Past by 200 miles", 
        maintenanceQuality: "Fair", 
        evidenceTags: ["Risk: High"],
        recommendation: "Inspect for oil leaks and replace valve cover gaskets if necessary to prevent engine damage."
      },
      { 
        id: "r4", 
        name: "Oil Cooler", 
        riskLevel: "High", 
        riskScore: 75, 
        probability: 0.20, 
        windowMin: 80000, 
        windowMax: 120000, 
        costMin: 500, 
        costMax: 900, 
        alreadyFixed: false, 
        mileageRisk: "At risk", 
        milesUntilFailureBucket: "Approaching", 
        maintenanceQuality: "Fair", 
        evidenceTags: ["Risk: High"],
        recommendation: "Monitor for coolant leaks and oil mixing; replace oil cooler if signs of failure appear."
      },
      { 
        id: "r5", 
        name: "Fuel Pump", 
        riskLevel: "Moderate", 
        riskScore: 45, 
        probability: 0.15, 
        windowMin: 60000, 
        windowMax: 100000, 
        costMin: 300, 
        costMax: 600, 
        alreadyFixed: false, 
        mileageRisk: "At risk", 
        milesUntilFailureBucket: "Past by 12,300 miles", 
        maintenanceQuality: "Fair", 
        evidenceTags: ["Risk: Moderate"],
        recommendation: "Test fuel pressure and replace fuel pump if performance issues or starting difficulties occur."
      },
      { 
        id: "r6", 
        name: "Transmission Solenoids", 
        riskLevel: "High", 
        riskScore: 75, 
        probability: 0.20, 
        windowMin: 70000, 
        windowMax: 120000, 
        costMin: 200, 
        costMax: 400, 
        alreadyFixed: false, 
        mileageRisk: "At risk", 
        milesUntilFailureBucket: "Past by 300 miles", 
        maintenanceQuality: "Fair", 
        evidenceTags: ["Risk: High"],
        recommendation: "Inspect transmission for shifting issues; replace solenoids if hesitation or rough shifting is detected."
      },
      { 
        id: "r7", 
        name: "Oxygen Sensors", 
        riskLevel: "Low", 
        riskScore: 0, 
        probability: 0.25, 
        windowMin: 60000, 
        windowMax: 100000, 
        costMin: 200, 
        costMax: 400, 
        alreadyFixed: true, 
        mileageRisk: "Low", 
        milesUntilFailureBucket: "Past by 2,700 miles", 
        maintenanceQuality: "Fair", 
        evidenceTags: ["Already Fixed"],
        recommendation: "Monitor for check engine lights; sensors have already been addressed."
      }
    ],

    leverageItems: [
      { id: "l1", title: "Transmission Solenoids Risk", severity: "High", costMin: 200, costMax: 400, negotiationAngle: "Transmission solenoids are a known failure point at this mileage (72k) and haven't been replaced. This is an impending cost.", questionsToAsk: ["Has the transmission shown any hesitation?", "Have the solenoids been checked?"], evidenceTags: ["Risk: High", "Mileage: 72k"] },
      { id: "l2", title: "Valve Cover Gasket Leaks", severity: "High", costMin: 200, costMax: 400, negotiationAngle: "Valve cover gaskets are prone to leaking around 50k-90k miles. At 72k, this is a high probability repair needed soon.", questionsToAsk: ["Any smell of burning oil?", "Have gaskets been replaced?"], evidenceTags: ["Risk: High"] },
      { id: "l3", title: "Service History Gaps", severity: "Medium", costMin: 300, costMax: 600, negotiationAngle: "Significant gaps in service history between 2019 and 2022. Neglected maintenance during this period could lead to issues.", questionsToAsk: ["Do you have records for the 2019-2022 period?"], evidenceTags: ["Gap: 2019-2022"] },
      { id: "l4", title: "Inconsistent Mileage Reporting", severity: "High", costMin: 0, costMax: 0, negotiationAngle: "Several service records lack mileage data, making it hard to verify actual usage and maintenance intervals.", questionsToAsk: ["Why are mileage records missing for some services?"], evidenceTags: ["Missing Mileage"] }
    ]
  },
  {
    id: "audi-a6-2018",
    year: 2018,
    make: "Audi",
    model: "A6",
    trim: "Quattro Premium Plus",
    engine: "3.0L V6 TFSI",
    vin: "WAU...A62018",
    mileage: 72176,
    drivetrain: "AWD",
    location: "Unknown",
    imageUrl: "/stock_images/2018_audi_a6_black_l_1a43d387.jpg",

    valuation: {
      retail: 23000,
      retailRange: [21000, 25000],
      privateParty: 21000,
      privateRange: [19000, 23000],
      tradeIn: 18000,
      tradeRange: [16000, 20000],
      depreciationCurve: [],
      projectedFutureValues: { year1: {retail: 21000, private: 19000}, year2: {retail: 19000, private: 17000}, year3: {retail: 17000, private: 15500}, year5: {retail: 14000, private: 12500} },
      depreciationStats: {
        msrp: 58000,
        totalDepreciation: 35000,
        totalDepreciationPct: 60.3,
        annualRate: 6.1,
        valueRetention: 39.7,
        mileageImpact: "Average",
        phase: "Stable",
        vsAverage: "Average",
        marketCondition: "Stable",
        marketTrend: "Stable",
        marketSegment: "Luxury"
      }
    },

    tco: {
      years: 3,
      milesPerYear: 12000,
      askingPrice: 20000,
      immediateCostBurden: 1200,
      routineMaintenanceCost: 2740,
      expectedUnscheduledRepairCost: 800,
      depreciationLoss: 5500,
      totalCost: 10240,
      expectedSalePrice: 23000,
      totalLoss: 7240,
      c12: 1200,
      eurc: 800,
      breakdown: [
        { name: "Depreciation", value: 5500 },
        { name: "Routine Maint.", value: 2740 },
        { name: "Immediate Fixes", value: 1200 },
        { name: "Unscheduled", value: 800 }
      ]
    },

    scores: {
      dipstickScore: 88,
      dealScore: 95,
      conditionScore: 92,
      riskLevel: "Low",
      counts: { high: 1, moderate: 2, low: 5, critical: 0, fixed: 0 }
    },
    
    serviceRecords: [
      { id: "a6_1", date: "2018-05-12", mileage: 15, category: "admin", description: "Vehicle sold to original owner", location: "Audi of Tysons Corner" },
      { id: "a6_2", date: "2019-04-10", mileage: 9800, category: "maintenance", description: "10,000 mile service performed, Oil and filter changed", location: "Audi of Tysons Corner" },
      { id: "a6_3", date: "2020-03-22", mileage: 19500, category: "maintenance", description: "20,000 mile service performed, Brake fluid flushed", location: "Audi of Tysons Corner" },
      { id: "a6_4", date: "2021-02-15", mileage: 28900, category: "maintenance", description: "30,000 mile service performed", location: "Audi of Tysons Corner" },
      { id: "a6_5", date: "2022-01-30", mileage: 39200, category: "maintenance", description: "40,000 mile service performed, Spark plugs replaced, DSG fluid changed", location: "Audi of Tysons Corner" },
      { id: "a6_6", date: "2022-12-10", mileage: 49800, category: "maintenance", description: "50,000 mile service performed, Oil and filter changed", location: "Independent Euro Shop" },
      { id: "a6_7", date: "2023-08-05", mileage: 58500, category: "repair", description: "Thermostat replaced, Coolant flush", location: "Independent Euro Shop" },
      { id: "a6_8", date: "2023-11-12", mileage: 61200, category: "maintenance", description: "60,000 mile service performed, Belt check", location: "Independent Euro Shop" },
      { id: "a6_9", date: "2024-05-20", mileage: 68000, category: "inspection", description: "Pre-trip inspection, Brakes checked (6mm remaining)", location: "Independent Euro Shop" },
      { id: "a6_10", date: "2024-10-15", mileage: 72100, category: "maintenance", description: "Oil and filter changed", location: "Jiffy Lube" },
      { id: "a6_11", date: "2024-12-01", mileage: 72176, category: "admin", description: "Vehicle listed for sale", location: "Dealer" }
    ],
    expertAnalysis: {
      overallEvaluation: "This 2018 Audi A6 is a solid example of the C7.5 platform with a largely consistent service history. However, it's entering a critical maintenance window. While the engine and transmission have been serviced on schedule (major 40k service done), the suspension is original and showing signs of wear. We detected a shift to budget quick-lube shops for the most recent service, which often precedes a sale to avoid deeper inspection costs. The 75k mile service is approaching, and original control arms at this mileage are a ticking time bomb.",
      confidenceScore: "High",
      confidenceReason: "Consistent records until very recently; key major services documented.",
      gaps: [],
      inconsistentMileage: [],
      servicesPerformedMoreThanNormal: [],
      expertNotes: [
        "Transmission Service: The critical 40k mile DSG service was performed on time, which is a huge plus for long-term reliability.",
        "Recent Quality Drop: The shift from 'Audi of Tysons Corner' to 'Jiffy Lube' for the last oil change suggests the previous owner stopped investing in premium care right before selling.",
        "Suspension Risk: No record of control arm replacement. At 72k miles on this heavy chassis, bushings are likely torn or cracking."
      ],
      anomalies: ["Shift to budget service provider for last entry"],
      concerns: ["Original suspension components at 72k miles", "Upcoming 75k/80k major service window"],
      positiveFindings: ["DSG service performed on schedule", "Thermostat (common failure point) already replaced", "Consistent oil change intervals (~10k miles)"]
    },
    routineMaintenanceSchedule: [
      { id: "rm_a6_1", item: "Oil Change", intervalMiles: 10000, intervalMonths: 12, costRange: [120, 180], oemCostRange: [180, 250], description: "Replace engine oil and filter", riskNote: "Standard maintenance." },
      { id: "rm_a6_2", item: "Brake Fluid", intervalMiles: 20000, intervalMonths: 24, costRange: [100, 150], oemCostRange: [150, 200], description: "Flush brake fluid", riskNote: "Moisture in fluid reduces braking efficiency." },
      { id: "rm_a6_3", item: "Spark Plugs", intervalMiles: 40000, intervalMonths: 48, costRange: [200, 350], oemCostRange: [350, 500], description: "Replace spark plugs", riskNote: "Misfires can damage catalytic converters." },
      { id: "rm_a6_4", item: "DSG Transmission Fluid", intervalMiles: 40000, intervalMonths: 48, costRange: [400, 600], oemCostRange: [600, 900], description: "Change DSG fluid and filter", riskNote: "Critical for transmission longevity. Failure is extremely expensive." }
    ],
    unscheduledForecast: [
      { 
        id: "uf_a6_1", 
        name: "Water Pump", 
        windowMin: 60000, 
        windowMax: 90000, 
        probability: 0.35, 
        costMin: 600, 
        costMax: 1000, 
        oemCostMin: 900, 
        oemCostMax: 1300,
        description: "Plastic housing can crack and leak."
      },
      { 
        id: "uf_a6_2", 
        name: "Thermostat", 
        windowMin: 60000, 
        windowMax: 90000, 
        probability: 0.10, // Lower prob because replaced
        costMin: 400, 
        costMax: 700, 
        oemCostMin: 600, 
        oemCostMax: 900,
        description: "Can fail stuck open or closed. (Already replaced in history)"
      },
      { 
        id: "uf_a6_3", 
        name: "PCV Valve", 
        windowMin: 70000, 
        windowMax: 100000, 
        probability: 0.25, 
        costMin: 200, 
        costMax: 400, 
        oemCostMin: 350, 
        oemCostMax: 550,
        description: "Failure leads to oil consumption and rough idle."
      },
      { 
        id: "uf_a6_4", 
        name: "Control Arm Bushings", 
        windowMin: 50000, 
        windowMax: 80000, 
        probability: 0.85, 
        costMin: 800, 
        costMax: 1200, 
        oemCostMin: 1200, 
        oemCostMax: 1600,
        description: "Wear causes suspension noise and alignment issues."
      }
    ],
    gapAnalysis: {
      totalItems: 4,
      overdue: 1,
      dueNow: 0,
      dueSoon: 1,
      items: [
         { 
          id: "ga_a6_1", 
          item: "Control Arm Bushings", 
          status: "overdue", 
          statusDetails: "Original parts at 72k miles",
          lastPerformed: "Never", 
          lastDoneMiles: 0,
          nextDue: "Now", 
          intervalMiles: 60000, 
          intervalMonths: 72, 
          costRange: [800, 1200], 
          oemCostRange: [1200, 1600], 
          riskNote: "Clunking, poor handling, and uneven tire wear are imminent.",
          severity: "High"
        },
        { 
          id: "ga_a6_2", 
          item: "75k Mile Service", 
          status: "dueSoon", 
          statusDetails: "Due in ~2,800 miles",
          lastPerformed: "60k Service", 
          lastDoneMiles: 61200,
          nextDue: "75,000 miles", 
          intervalMiles: 15000, 
          intervalMonths: 12, 
          costRange: [300, 500], 
          oemCostRange: [500, 800], 
          riskNote: "Standard interval service including comprehensive checks.",
          severity: "Low"
        }
      ]
    },
    risks: [
      { 
        id: "r_a6_1", 
        name: "Water Pump Failure", 
        riskLevel: "Moderate", 
        riskScore: 65, 
        probability: 0.35, 
        windowMin: 60000, 
        windowMax: 90000, 
        costMin: 600, 
        costMax: 1000, 
        alreadyFixed: false, 
        mileageRisk: "In window", 
        milesUntilFailureBucket: "Now", 
        maintenanceQuality: "Good", 
        evidenceTags: ["Common Issue"],
        recommendation: "Inspect for coolant leaks. Plastic housing is a known weak point."
      },
      { 
        id: "r_a6_2", 
        name: "Control Arm Bushings", 
        riskLevel: "High", 
        riskScore: 85, 
        probability: 0.85, 
        windowMin: 50000, 
        windowMax: 80000, 
        costMin: 800, 
        costMax: 1200, 
        alreadyFixed: false, 
        mileageRisk: "High risk", 
        milesUntilFailureBucket: "Overdue", 
        maintenanceQuality: "Unknown", 
        evidenceTags: ["Wear Item", "Original Parts"],
        recommendation: "Listen for clunking over bumps. Bushings tear and leak hydraulic fluid."
      },
       { 
        id: "r_a6_3", 
        name: "PCV Valve", 
        riskLevel: "Low", 
        riskScore: 40, 
        probability: 0.25, 
        windowMin: 70000, 
        windowMax: 100000, 
        costMin: 200, 
        costMax: 400, 
        alreadyFixed: false, 
        mileageRisk: "Approaching", 
        milesUntilFailureBucket: "Near future", 
        maintenanceQuality: "Good", 
        evidenceTags: ["Common Issue"],
        recommendation: "Monitor oil consumption. Whistling noise indicates failure."
      }
    ],
    leverageItems: [
      { 
        id: "l_a6_1", 
        title: "Deferred Suspension Maint.", 
        severity: "High", 
        costMin: 800, 
        costMax: 1200, 
        negotiationAngle: "Control arms are original at 72k miles and commonly fail by this mileage. This is an immediate repair liability.", 
        questionsToAsk: ["Have the control arms ever been replaced?", "Is there any clunking over speed bumps?"], 
        evidenceTags: ["Original Parts", "Common Failure"] 
      },
      { 
        id: "l_a6_2", 
        title: "Impending 75k Service", 
        severity: "Low", 
        costMin: 300, 
        costMax: 500, 
        negotiationAngle: "Vehicle is approaching a scheduled service interval.", 
        questionsToAsk: [], 
        evidenceTags: ["Maintenance Schedule"] 
      }
    ]
  }
];

export const getVehicle = (id: string) => vehicles.find(v => v.id === id);

export const getComparison = (ids: string[]) => {
  if (ids.length === 0) return vehicles;
  return vehicles.filter(v => ids.includes(v.id));
};
