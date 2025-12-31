import { apiRequest } from "./queryClient";

// Base URL for the prototype backend API
// In development: uses vite proxy at /api/prototype (which rewrites to /api)
// In production: uses full backend URL from VITE_PROTOTYPE_API_URL
// Backend routes are at /api/* (e.g., /api/portfolio, /api/parse-pdf)
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_PROTOTYPE_API_URL;
  
  if (envUrl) {
    // Production: VITE_PROTOTYPE_API_URL should be the full backend URL
    // e.g., "https://your-backend.railway.app"
    // We append /api to get the API base URL
    const baseUrl = envUrl.replace(/\/$/, ''); // Remove trailing slash
    const apiUrl = `${baseUrl}/api`;
    console.log('[API] 🔗 Using backend URL:', apiUrl);
    return apiUrl;
  }
  
  // Development: Use vite proxy path (rewrites /api/prototype to /api)
  console.log('[API] 🔗 Using dev proxy:', '/api/prototype');
  return '/api/prototype';
};

const API_BASE_URL = getApiBaseUrl();
console.log('[API] 📍 API_BASE_URL configured as:', API_BASE_URL);

// Vehicle/Portfolio API
export interface VehicleData {
  make: string;
  model: string;
  year: number;
  mileage: number;
  trim?: string;
  engine?: string;
  vin?: string;
}

export interface Portfolio {
  portfolioId: string;
  vehicleData: VehicleData;
  serviceHistory?: any;
  parsedHistory?: any;
  serviceAnalysis?: any;
  routineMaintenance?: any;
  unscheduledMaintenance?: any;
  gapAnalysis?: any;
  riskEvaluation?: any;
  marketValuation?: any;
  totalCostOfOwnership?: any;
}

// Get all portfolios
export async function getAllPortfolios(): Promise<{ portfolios: Portfolio[] }> {
  const res = await apiRequest('GET', `${API_BASE_URL}/portfolio`);
  return res.json();
}

// Get a single portfolio
export async function getPortfolio(portfolioId: string): Promise<{ portfolio: Portfolio }> {
  const res = await apiRequest('GET', `${API_BASE_URL}/portfolio/${portfolioId}`);
  return res.json();
}

// Save/Update portfolio
export async function savePortfolio(portfolioData: Partial<Portfolio>): Promise<{ success: boolean; portfolioId: string }> {
  console.log('[API] 💾 Saving portfolio to:', `${API_BASE_URL}/portfolio`);
  console.log('[API] 📦 Portfolio data:', portfolioData);
  const res = await apiRequest('POST', `${API_BASE_URL}/portfolio`, portfolioData);
  const result = await res.json();
  console.log('[API] ✅ Save response:', result);
  return result;
}

// Delete portfolio
export async function deletePortfolio(portfolioId: string): Promise<void> {
  await apiRequest('DELETE', `${API_BASE_URL}/portfolio/${portfolioId}`);
}

// Parse PDF
export async function parsePdf(pdfFile: File): Promise<any> {
  const formData = new FormData();
  formData.append('serviceHistory', pdfFile);

  const url = `${API_BASE_URL}/parse-pdf`;
  console.log('[Frontend] 📤 Calling PDF parse API:', url);
  console.log('[Frontend] 📄 File:', pdfFile.name, `(${(pdfFile.size / 1024).toFixed(2)} KB)`);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  
  console.log('[Frontend] 📥 Response status:', res.status, res.statusText);
  
  if (!res.ok) {
    const text = await res.text();
    console.error('[Frontend] ❌ API error response:', text);
    throw new Error(`${res.status}: ${text}`);
  }

  const json = await res.json();
  console.log('[Frontend] ✅ API response JSON:', json);
  console.log('[Frontend] 📦 Returning result with serviceHistory:', json.serviceHistory ? 'YES' : 'NO');
  return json;

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  return res.json();
}

// Get routine maintenance
export async function getRoutineMaintenance(vehicleData: VehicleData): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/routine-maintenance`, vehicleData);
  return res.json();
}

// Get unscheduled maintenance
export async function getUnscheduledMaintenance(vehicleData: VehicleData): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/unscheduled-maintenance`, vehicleData);
  return res.json();
}

// Analyze service history
export async function analyzeServiceHistory(
  vehicleData: VehicleData,
  serviceHistory: any
): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/analyze-service-history`, {
    ...vehicleData,
    serviceHistory,
  });
  return res.json();
}

// Perform gap analysis
export async function performGapAnalysis(
  vehicleData: VehicleData,
  serviceHistory: any,
  routineMaintenance: any
): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/maintenance-gap-analysis`, {
    ...vehicleData,
    serviceHistory,
    routineMaintenance,
  });
  return res.json();
}

// Evaluate unscheduled maintenance risk
export async function evaluateUnscheduledMaintenanceRisk(
  vehicleData: VehicleData,
  serviceHistory: any,
  serviceHistoryAnalysis: any,
  unscheduledMaintenance: any
): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/unscheduled-maintenance-risk`, {
    ...vehicleData,
    serviceHistory,
    serviceHistoryAnalysis,
    unscheduledMaintenance,
  });
  return res.json();
}

// Get market valuation
export async function getMarketValuation(vehicleData: VehicleData): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/market-valuation`, vehicleData);
  const data = await res.json();
  // API returns { success: true, valuation: {...} }, return just the valuation object
  return data.valuation || data;
}

// Calculate total cost of ownership
export async function calculateTotalCostOfOwnership(
  vehicleData: VehicleData,
  tcoParams: {
    purchasePrice: number;
    timePeriodYears: number;
    milesPerYear: number;
    gapAnalysis?: any;
    riskEvaluation?: any;
    serviceHistoryAnalysis?: any;
    routineMaintenance?: any;
    marketValuation?: any;
  }
): Promise<any> {
  const requestBody: any = {
    ...vehicleData,
    purchasePrice: tcoParams.purchasePrice,
    timePeriodYears: tcoParams.timePeriodYears,
    milesPerYear: tcoParams.milesPerYear,
  };

  if (tcoParams.gapAnalysis) requestBody.gapAnalysis = tcoParams.gapAnalysis;
  if (tcoParams.riskEvaluation) requestBody.riskEvaluation = tcoParams.riskEvaluation;
  if (tcoParams.serviceHistoryAnalysis) requestBody.serviceHistoryAnalysis = tcoParams.serviceHistoryAnalysis;
  if (tcoParams.routineMaintenance) requestBody.routineMaintenance = tcoParams.routineMaintenance;
  if (tcoParams.marketValuation) requestBody.marketValuation = tcoParams.marketValuation;

  const res = await apiRequest('POST', `${API_BASE_URL}/total-cost-of-ownership`, requestBody);
  return res.json();
}

