import { COMPANY } from "@/data/company";
import { TENDERS } from "@/data/tenders";
import { ENTITIES, entityById } from "@/data/entities";
import type { CompanyProfile, FitBreakdown, Tender, TenderStatus } from "@/data/types";

/** Stable "today" for the prototype - evaluated once per session. */
export const NOW = new Date();

export function dateFromOffset(days: number): Date {
  const d = new Date(NOW);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatMoney(value: number | null): string {
  if (value === null) return "Not disclosed";
  if (value >= 1000000) return `US$${(value / 1000000).toFixed(2)}m`;
  if (value >= 1000) return `US$${Math.round(value / 1000)}k`;
  return `US$${value}`;
}

export function fitScore(fit: FitBreakdown): number {
  return Math.round(
    fit.capability * 0.3 + fit.category * 0.25 + fit.eligibility * 0.2 + fit.documentation * 0.1 + fit.timeline * 0.15,
  );
}

export type Urgency = "critical" | "urgent" | "soon" | "normal" | "closed";

export function urgencyOf(daysRemaining: number): Urgency {
  if (daysRemaining < 0) return "closed";
  if (daysRemaining <= 2) return "critical";
  if (daysRemaining <= 4) return "urgent";
  if (daysRemaining <= 7) return "soon";
  return "normal";
}

export type EnrichedTender = Tender & {
  published: Date;
  closing: Date;
  daysRemaining: number;
  score: number;
  urgency: Urgency;
  displayStatus: TenderStatus;
  entityName: string;
  entityType: string;
  recommendation: Recommendation;
};

export type Recommendation = "Strongly Pursue" | "Consider" | "Weak Fit" | "Do Not Pursue";

export function recommendationFor(score: number): Recommendation {
  if (score >= 85) return "Strongly Pursue";
  if (score >= 65) return "Consider";
  if (score >= 45) return "Weak Fit";
  return "Do Not Pursue";
}

function preferenceAdjustment(t: Tender, preferences: CompanyProfile["preferences"]): number {
  let adjustment = 0;
  const categoryName = t.category.toLowerCase();
  const preferredCategories = preferences.preferredCategories.map((c) => c.toLowerCase());
  const preferredLocations = preferences.preferredLocations.map((l) => l.toLowerCase());
  const excludedCategories = preferences.excludedCategories.map((c) => c.toLowerCase());

  if (preferredCategories.includes(categoryName)) adjustment += 6;
  if (excludedCategories.includes(categoryName)) adjustment -= 20;
  if (preferredLocations.some((loc) => t.location.toLowerCase().includes(loc))) adjustment += 3;

  if (t.estimatedValue !== null) {
    if (t.estimatedValue >= preferences.minValue && t.estimatedValue <= preferences.maxValue) adjustment += 5;
    if (t.estimatedValue > preferences.maxValue) adjustment -= 4;
    if (t.estimatedValue < preferences.minValue / 2) adjustment -= 2;
  }

  if (t.closingOffsetDays >= preferences.minLeadTimeDays) adjustment += 4;
  if (t.closingOffsetDays < preferences.minLeadTimeDays) adjustment -= 5;

  return adjustment;
}

export function scoreOpportunity(t: Tender, preferences: CompanyProfile["preferences"] = COMPANY.preferences): number {
  return Math.max(0, Math.min(100, fitScore(t.fit) + preferenceAdjustment(t, preferences)));
}

export function enrich(t: Tender, preferences: CompanyProfile["preferences"] = COMPANY.preferences): EnrichedTender {
  const published = dateFromOffset(t.publishedOffsetDays);
  const closing = dateFromOffset(t.closingOffsetDays);
  const daysRemaining = t.closingOffsetDays;
  const score = scoreOpportunity(t, preferences);
  const urgency = urgencyOf(daysRemaining);
  const entity = entityById(t.entityId);
  const displayStatus: TenderStatus =
    t.status !== "Open" ? t.status : daysRemaining < 0 ? "Closed" : daysRemaining <= 7 ? "Closing Soon" : "Open";
  return {
    ...t,
    published,
    closing,
    daysRemaining,
    score,
    urgency,
    displayStatus,
    entityName: entity?.name ?? "Unknown entity",
    entityType: entity?.type ?? "",
    recommendation: recommendationFor(score),
  };
}

export const OPPORTUNITIES: EnrichedTender[] = TENDERS.map((t) => enrich(t)).sort((a, b) => b.score - a.score);

export function rankedOpportunities(preferences: CompanyProfile["preferences"] = COMPANY.preferences): EnrichedTender[] {
  return TENDERS.map((t) => enrich(t, preferences)).sort((a, b) => b.score - a.score);
}

export const opportunityById = (id: string, preferences: CompanyProfile["preferences"] = COMPANY.preferences) =>
  rankedOpportunities(preferences).find((o) => o.id === id);

export const openOpportunities = (preferences: CompanyProfile["preferences"] = COMPANY.preferences) =>
  rankedOpportunities(preferences).filter((o) => o.daysRemaining >= 0 && o.status === "Open");

export const missingRequirements = (t: Tender) =>
  [...t.eligibility, ...t.technical].filter((r) => r.met !== "met");

export const fitFactors = (t: Tender): { key: keyof FitBreakdown; label: string; value: number; why: string }[] => [
  {
    key: "capability",
    label: "Capability Match",
    value: t.fit.capability,
    why: "Compares the tender scope against your registered capabilities and delivered contract history.",
  },
  {
    key: "category",
    label: "Category Match",
    value: t.fit.category,
    why: `Measures alignment between required supplier category ${t.categoryCode} and your PRAZ category registrations.`,
  },
  {
    key: "eligibility",
    label: "Eligibility",
    value: t.fit.eligibility,
    why: "Checks mandatory eligibility criteria against your company registrations, certificates and references.",
  },
  {
    key: "documentation",
    label: "Documentation Readiness",
    value: t.fit.documentation,
    why: "Share of required submission documents already current in your company document library.",
  },
  {
    key: "timeline",
    label: "Timeline Feasibility",
    value: t.fit.timeline,
    why: "Assesses the submission window and required delivery lead time against your stated minimum lead time.",
  },
];

export const categoryCounts = (preferences: CompanyProfile["preferences"] = COMPANY.preferences) => {
  const map = new Map<string, number>();
  openOpportunities(preferences).forEach((o) => map.set(o.category, (map.get(o.category) ?? 0) + 1));
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
};

export const entityCounts = (preferences: CompanyProfile["preferences"] = COMPANY.preferences) => {
  const map = new Map<string, number>();
  openOpportunities(preferences).forEach((o) => map.set(o.entityName, (map.get(o.entityName) ?? 0) + 1));
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
};

export const valueBands = (preferences: CompanyProfile["preferences"] = COMPANY.preferences) => {
  const bands = [
    { name: "< $50k", min: 0, max: 50000 },
    { name: "$50k-$150k", min: 50000, max: 150000 },
    { name: "$150k-$300k", min: 150000, max: 300000 },
    { name: "> $300k", min: 300000, max: Infinity },
  ];
  return bands.map((b) => ({
    name: b.name,
    count: openOpportunities(preferences).filter((o) => o.estimatedValue !== null && o.estimatedValue >= b.min && o.estimatedValue < b.max).length,
  }));
};

export const LOCATIONS = [...new Set(TENDERS.map((t) => t.location))].sort();
export const ENTITY_OPTIONS = ENTITIES.map((e) => ({ id: e.id, name: e.name }));
