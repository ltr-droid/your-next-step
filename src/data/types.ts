export type TenderStatus = "Open" | "Closing Soon" | "Closed" | "Awarded" | "Cancelled";

export type FitBreakdown = {
  capability: number;
  category: number;
  eligibility: number;
  documentation: number;
  timeline: number;
};

export type RequirementItem = {
  id: string;
  label: string;
  detail?: string;
  met: "met" | "partial" | "missing";
};

export type TenderDocument = {
  id: string;
  filename: string;
  type: string;
  required: boolean;
  status: "Available" | "On Request" | "Restricted";
  size: string;
};

export type Tender = {
  id: string;
  reference: string;
  title: string;
  entityId: string;
  categoryCode: string;
  category: string;
  description: string;
  scope: string[];
  procurementMethod: string;
  publishedOffsetDays: number; // negative = in the past
  closingOffsetDays: number;
  estimatedValue: number | null;
  currency: "USD";
  tenderType: string;
  location: string;
  status: Exclude<TenderStatus, "Closing Soon">;
  fit: FitBreakdown;
  fitNotes: { positive: string[]; caution: string[] };
  eligibility: RequirementItem[];
  technical: RequirementItem[];
  commercial: { label: string; value: string }[];
  documents: TenderDocument[];
  contact: { name: string; role: string; email: string; phone: string };
  recommendationNote: string;
  preparationEffort: "Low" | "Medium" | "High";
  riskLevel: "Low" | "Medium" | "High";
};

export type ProcuringEntity = {
  id: string;
  name: string;
  type: string;
  location: string;
  about: string;
  historicalTenders: number;
  majorCategories: string[];
  averageTenderValue: number;
};

export type Award = {
  id: string;
  entityId: string;
  tender: string;
  reference: string;
  category: string;
  date: string;
  supplier: string;
  value: number;
};

export type CompanyProfile = {
  name: string;
  type: string;
  location: string;
  yearsOperating: number;
  employees: number;
  annualCapacity: number;
  about: string;
  capabilities: string[];
  categories: { code: string; name: string }[];
  certifications: { name: string; status: "Valid" | "Expiring" | "Missing"; detail: string }[];
  documents: { filename: string; type: string; updated: string; status: "Current" | "Expiring" | "Missing" }[];
  preferences: {
    preferredCategories: string[];
    minValue: number;
    maxValue: number;
    preferredLocations: string[];
    minLeadTimeDays: number;
    excludedCategories: string[];
  };
};
