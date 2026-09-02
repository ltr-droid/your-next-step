import { useEffect, useRef } from "react";
import { fitFactors, missingRequirements, rankedOpportunities, type EnrichedTender } from "@/lib/bidlens";
import { useAppState, type ChecklistStatus, type Workspace } from "@/state/app-state";

type ToolSchema = {
  type: "object";
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

type WebMCPTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: ToolSchema;
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
};

type ModelContext = {
  registerTool: (tool: WebMCPTool, options?: { signal?: AbortSignal }) => Promise<void> | void;
};

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

const opportunitySchema: ToolSchema = {
  type: "object",
  properties: {
    query: { type: "string", description: "Keyword, tender reference, buyer or category to search for." },
    category: { type: "string", description: "Exact supplier category name or category code." },
    location: { type: "string", description: "Location filter such as Harare or Bulawayo." },
    minFit: { type: "number", description: "Minimum BidLens fit score from 0 to 100." },
    maxValue: { type: "number", description: "Maximum estimated contract value." },
    openOnly: { type: "boolean", description: "Only return currently open opportunities." },
  },
  additionalProperties: false,
};

const tenderIdSchema: ToolSchema = {
  type: "object",
  properties: {
    tenderId: { type: "string", description: "The tender identifier, for example t-zpc-network." },
  },
  required: ["tenderId"],
  additionalProperties: false,
};

const compareSchema: ToolSchema = {
  type: "object",
  properties: {
    tenderIds: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: { type: "string" },
      description: "Two or three tender identifiers to compare.",
    },
  },
  required: ["tenderIds"],
  additionalProperties: false,
};

const updateWorkspaceSchema: ToolSchema = {
  type: "object",
  properties: {
    tenderId: { type: "string", description: "Tender identifier for the bid workspace." },
    checklistItemId: { type: "string", description: "Checklist item identifier such as c10." },
    status: { type: "string", enum: ["complete", "incomplete", "not_applicable"] },
    note: { type: "string", description: "Note for a checklist item." },
    documentId: { type: "string", description: "Workspace document identifier." },
    attached: { type: "boolean", description: "Whether the document should be attached." },
    notes: { type: "string", description: "Overall bid workspace notes." },
    readyForSubmission: { type: "boolean", description: "Whether the workspace should be marked ready." },
  },
  required: ["tenderId"],
  additionalProperties: false,
};

function getTender(tenderId: string, preferences: Parameters<typeof rankedOpportunities>[0]) {
  return rankedOpportunities(preferences).find((tender) => tender.id === tenderId);
}

function tenderSummary(tender: EnrichedTender) {
  return {
    id: tender.id,
    reference: tender.reference,
    title: tender.title,
    entity: tender.entityName,
    category: tender.category,
    location: tender.location,
    status: tender.displayStatus,
    closing: tender.closing.toISOString(),
    daysRemaining: tender.daysRemaining,
    estimatedValue: tender.estimatedValue,
    fitScore: tender.score,
    recommendation: tender.recommendation,
  };
}

function requireObject(value: unknown): Record<string, unknown> {
  const parsed =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            return null;
          }
        })()
      : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Tool input must be an object.");
  }
  return parsed as Record<string, unknown>;
}

function requireString(input: Record<string, unknown>, key: string): string {
  const value = input[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(key + " is required.");
  return value.trim();
}

function approve(message: string): boolean {
  return typeof window !== "undefined" && window.confirm(message);
}

function findOpportunities(input: Record<string, unknown>, preferences: Parameters<typeof rankedOpportunities>[0]) {
  const query = typeof input.query === "string" ? input.query.toLowerCase().trim() : "";
  const category = typeof input.category === "string" ? input.category.toLowerCase().trim() : "";
  const location = typeof input.location === "string" ? input.location.toLowerCase().trim() : "";
  const minFit = typeof input.minFit === "number" ? input.minFit : 0;
  const maxValue = typeof input.maxValue === "number" ? input.maxValue : Infinity;
  const openOnly = input.openOnly !== false;

  return rankedOpportunities(preferences)
    .filter((tender) => {
      const haystack = (tender.title + " " + tender.reference + " " + tender.entityName + " " + tender.category + " " + tender.description).toLowerCase();
      return (
        (!query || haystack.includes(query)) &&
        (!category || tender.category.toLowerCase().includes(category) || tender.categoryCode.toLowerCase() === category) &&
        (!location || tender.location.toLowerCase().includes(location)) &&
        tender.score >= minFit &&
        (tender.estimatedValue === null || tender.estimatedValue <= maxValue) &&
        (!openOnly || (tender.status === "Open" && tender.daysRemaining >= 0))
      );
    })
    .slice(0, 20)
    .map(tenderSummary);
}

export function WebMcpBridge() {
  const { state, workspaceFor, createWorkspace, setChecklistStatus, setChecklistNote, toggleDoc, setNotes, setReady, log } =
    useAppState();
  const contextRef = useRef({
    state,
    workspaceFor,
    createWorkspace,
    setChecklistStatus,
    setChecklistNote,
    toggleDoc,
    setNotes,
    setReady,
    log,
  });

  useEffect(() => {
    contextRef.current = {
      state,
      workspaceFor,
      createWorkspace,
      setChecklistStatus,
      setChecklistNote,
      toggleDoc,
      setNotes,
      setReady,
      log,
    };
  }, [state, workspaceFor, createWorkspace, setChecklistStatus, setChecklistNote, toggleDoc, setNotes, setReady, log]);

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext) return;

    const controller = new AbortController();
    const tools: WebMCPTool[] = [
      {
        name: "find_opportunities",
        title: "Find procurement opportunities",
        description: "Find open Zimbabwean procurement opportunities matching a supplier's capabilities and constraints.",
        inputSchema: opportunitySchema,
        execute: (rawInput) => findOpportunities(requireObject(rawInput), contextRef.current.state.preferences),
      },
      {
        name: "investigate_opportunity",
        title: "Investigate an opportunity",
        description: "Analyze a tender's fit, requirements, risks, missing documents and preparation status.",
        inputSchema: tenderIdSchema,
        execute: (rawInput) => {
          const input = requireObject(rawInput);
          const tender = getTender(requireString(input, "tenderId"), contextRef.current.state.preferences);
          if (!tender) throw new Error("Opportunity not found.");
          const workspace = contextRef.current.workspaceFor(tender.id);
          return {
            opportunity: tenderSummary(tender),
            fitFactors: fitFactors(tender).map(({ key, label, value, why }) => ({ key, label, value, why })),
            missingRequirements: missingRequirements(tender),
            missingDocuments: tender.documents.filter((doc) => doc.required && doc.status !== "Available"),
            workspace: workspace
              ? {
                  readiness: workspaceReadiness(workspace),
                  checklistItems: workspace.checklist.length,
                  documentsAttached: workspace.documents.filter((doc) => doc.attached).length,
                }
              : null,
          };
        },
      },
      {
        name: "compare_opportunities",
        title: "Compare procurement opportunities",
        description: "Compare two or three opportunities and recommend the strongest option for the supplier.",
        inputSchema: compareSchema,
        execute: (rawInput) => {
          const input = requireObject(rawInput);
          const ids = input.tenderIds;
          if (!Array.isArray(ids) || ids.length < 2 || ids.length > 3 || ids.some((id) => typeof id !== "string")) {
            throw new Error("tenderIds must contain two or three tender identifiers.");
          }
          const items = ids.map((id) => getTender(id, contextRef.current.state.preferences)).filter(Boolean) as EnrichedTender[];
          if (items.length !== ids.length) throw new Error("One or more opportunities were not found.");
          const strongest = [...items].sort((a, b) => b.score - a.score)[0];
          return {
            recommendation: {
              tenderId: strongest.id,
              reason: strongest.reference + " has the highest fit score at " + strongest.score + "% and is rated " + strongest.recommendation + ".",
            },
            opportunities: items.map((tender) => ({
              ...tenderSummary(tender),
              missingRequiredDocuments: tender.documents.filter((doc) => doc.required && doc.status !== "Available").length,
              preparationEffort: tender.preparationEffort,
              riskLevel: tender.riskLevel,
            })),
          };
        },
      },
      {
        name: "prepare_bid_workspace",
        title: "Prepare a bid workspace",
        description: "Create a structured bid preparation workspace after the supplier approves the action.",
        inputSchema: tenderIdSchema,
        execute: (rawInput) => {
          const input = requireObject(rawInput);
          const tenderId = requireString(input, "tenderId");
          const tender = getTender(tenderId, contextRef.current.state.preferences);
          if (!tender) throw new Error("Opportunity not found.");
          if (contextRef.current.workspaceFor(tenderId)) {
            return { created: false, tenderId, message: "A workspace already exists for this opportunity." };
          }
          if (!approve("Create a bid workspace for " + tender.reference + "?")) {
            return { created: false, approved: false, message: "Human approval was not granted." };
          }
          contextRef.current.createWorkspace(tenderId);
          contextRef.current.log("Bid workspace created for " + tender.reference, "agent");
          return { created: true, approved: true, tenderId, workspaceUrl: "/workspaces/" + tenderId };
        },
      },
      {
        name: "update_bid_workspace",
        title: "Update a bid workspace",
        description: "Update checklist status, checklist notes, document attachments, bid notes or readiness after human approval.",
        inputSchema: updateWorkspaceSchema,
        execute: (rawInput) => {
          const input = requireObject(rawInput);
          const tenderId = requireString(input, "tenderId");
          const workspace = contextRef.current.workspaceFor(tenderId);
          if (!workspace) throw new Error("No bid workspace exists for this tender.");
          const changes = Object.keys(input).filter((key) => key !== "tenderId");
          if (changes.length === 0) throw new Error("Provide at least one workspace change.");
          if (!approve("Apply " + changes.join(", ") + " to the " + tenderId + " bid workspace?")) {
            return { updated: false, approved: false, message: "Human approval was not granted." };
          }

          if (typeof input.checklistItemId === "string" && typeof input.status === "string") {
            contextRef.current.setChecklistStatus(tenderId, input.checklistItemId, input.status as ChecklistStatus);
          }
          if (typeof input.checklistItemId === "string" && typeof input.note === "string") {
            contextRef.current.setChecklistNote(tenderId, input.checklistItemId, input.note);
          }
          if (typeof input.documentId === "string" && typeof input.attached === "boolean") {
            const current = workspace.documents.find((doc) => doc.id === input.documentId);
            if (current && current.attached !== input.attached) contextRef.current.toggleDoc(tenderId, input.documentId);
          }
          if (typeof input.notes === "string") contextRef.current.setNotes(tenderId, input.notes);
          if (typeof input.readyForSubmission === "boolean") contextRef.current.setReady(tenderId, input.readyForSubmission);
          contextRef.current.log("Bid workspace updated for " + tenderId, "agent");
          return { updated: true, approved: true, tenderId, changes };
        },
      },
    ];

    void Promise.all(tools.map((tool) => Promise.resolve(modelContext.registerTool(tool, { signal: controller.signal })))).catch((error) => {
      console.warn("WebMCP tool registration failed", error);
    });

    return () => controller.abort();
  }, []);

  return null;
}

function workspaceReadiness(workspace: Workspace): number {
  const applicable = workspace.checklist.filter((item) => item.status !== "not_applicable");
  const completed = applicable.filter((item) => item.status === "complete").length;
  const requiredDocs = workspace.documents.filter((doc) => doc.required);
  const attachedDocs = requiredDocs.filter((doc) => doc.attached).length;
  const total = applicable.length + requiredDocs.length;
  return total === 0 ? 0 : Math.round(((completed + attachedDocs) / total) * 100);
}
