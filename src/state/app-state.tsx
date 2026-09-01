import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { opportunityById, OPPORTUNITIES, type EnrichedTender } from "@/lib/bidlens";
import type { Tender } from "@/data/types";

export type ChecklistStatus = "complete" | "incomplete" | "not_applicable";

export type ChecklistItem = {
  id: string;
  group: "Company" | "Technical" | "Commercial";
  label: string;
  status: ChecklistStatus;
  note?: string;
};

export type WorkspaceDoc = { id: string; filename: string; required: boolean; attached: boolean };

export type Clarification = { id: string; question: string; asked: boolean; createdAt: string };

export type Workspace = {
  tenderId: string;
  createdAt: string;
  checklist: ChecklistItem[];
  documents: WorkspaceDoc[];
  clarifications: Clarification[];
  notes: string;
  readyForSubmission: boolean;
  analysisStartedAt?: string;
};

type Persisted = {
  saved: string[];
  analyzed: string[];
  compare: string[];
  workspaces: Record<string, Workspace>;
  activity: { id: string; text: string; at: string; actor: "human" | "agent" }[];
};

const KEY = "bidlens.state.v1";

const defaultChecklist = (t: Tender): ChecklistItem[] => [
  { id: "c1", group: "Company", label: "Certificate of incorporation", status: "complete" },
  { id: "c2", group: "Company", label: "Valid tax clearance (ITF263)", status: "complete" },
  { id: "c3", group: "Company", label: "PRAZ supplier registration certificate", status: "complete" },
  { id: "c4", group: "Company", label: "Audited financial statements", status: "complete" },
  { id: "c5", group: "Company", label: "Three comparable contract references", status: "incomplete" },
  { id: "c6", group: "Technical", label: "Product specifications response", status: "complete" },
  {
    id: "c7",
    group: "Technical",
    label: "Manufacturer authorisation letter",
    status: t.technical.some((r) => r.label.toLowerCase().includes("authoris") && r.met === "missing")
      ? "incomplete"
      : "complete",
  },
  { id: "c8", group: "Technical", label: "Warranty and support documentation", status: "complete" },
  { id: "c9", group: "Technical", label: "Certified engineer CVs", status: "incomplete" },
  { id: "c10", group: "Commercial", label: "Pricing schedule", status: "incomplete" },
  { id: "c11", group: "Commercial", label: "Delivery schedule", status: "incomplete" },
  { id: "c12", group: "Commercial", label: "Bid security arrangement", status: "incomplete" },
];

const defaultDocs = (t: Tender): WorkspaceDoc[] =>
  t.documents.map((d, i) => ({ id: d.id, filename: d.filename, required: d.required, attached: i < 2 }));

export function newWorkspace(t: Tender, seed?: Partial<Workspace>): Workspace {
  return {
    tenderId: t.id,
    createdAt: new Date().toISOString(),
    checklist: defaultChecklist(t),
    documents: defaultDocs(t),
    clarifications: [],
    notes: "",
    readyForSubmission: false,
    ...seed,
  };
}

function seedState(): Persisted {
  const saved = ["t-zpc-network", "t-mhtestd-laptops", "t-mpilo-network", "t-uz-cabling", "t-zpc-ups", "t-moh-tablets"];
  const wsA = OPPORTUNITIES.find((o) => o.id === "t-zpc-network")!;
  const wsB = OPPORTUNITIES.find((o) => o.id === "t-mhtestd-laptops")!;
  const a = newWorkspace(wsA, { analysisStartedAt: new Date().toISOString() });
  const b = newWorkspace(wsB);
  b.checklist = b.checklist.map((c) =>
    ["c10", "c9"].includes(c.id) ? { ...c, status: "complete" as ChecklistStatus } : c,
  );
  a.notes = "Confirm OEM authorisation with distributor before Friday. Pricing draft in shared drive.";
  a.clarifications = [
    {
      id: "q1",
      question: "Will the manufacturer authorisation letter be accepted from a regional distributor?",
      asked: true,
      createdAt: new Date().toISOString(),
    },
  ];
  return {
    saved,
    analyzed: ["t-zpc-network", "t-mhtestd-laptops"],
    compare: [],
    workspaces: { [a.tenderId]: a, [b.tenderId]: b },
    activity: [
      { id: "ac1", text: "Bid workspace created for ZPC/DOM/59/2026", at: new Date().toISOString(), actor: "human" },
      { id: "ac2", text: "Analysis completed for MHTESTD/PROC/28/2026", at: new Date().toISOString(), actor: "agent" },
    ],
  };
}

type Ctx = {
  state: Persisted;
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
  markAnalyzed: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  createWorkspace: (id: string) => void;
  workspaceFor: (id: string) => Workspace | undefined;
  updateWorkspace: (id: string, fn: (w: Workspace) => Workspace) => void;
  setChecklistStatus: (id: string, itemId: string, status: ChecklistStatus) => void;
  setChecklistNote: (id: string, itemId: string, note: string) => void;
  toggleDoc: (id: string, docId: string) => void;
  addClarification: (id: string, question: string) => void;
  setNotes: (id: string, notes: string) => void;
  setReady: (id: string, ready: boolean) => void;
  readiness: (id: string) => number;
  log: (text: string, actor?: "human" | "agent") => void;
};

const AppStateContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => seedState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as Persisted);
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  const log = useCallback((text: string, actor: "human" | "agent" = "human") => {
    setState((s) => ({
      ...s,
      activity: [{ id: crypto.randomUUID(), text, at: new Date().toISOString(), actor }, ...s.activity].slice(0, 25),
    }));
  }, []);

  const value = useMemo<Ctx>(() => {
    const updateWorkspace: Ctx["updateWorkspace"] = (id, fn) =>
      setState((s) => {
        const ws = s.workspaces[id];
        if (!ws) return s;
        return { ...s, workspaces: { ...s.workspaces, [id]: fn(ws) } };
      });

    return {
      state,
      log,
      isSaved: (id) => state.saved.includes(id),
      toggleSave: (id) =>
        setState((s) => ({
          ...s,
          saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id],
        })),
      markAnalyzed: (id) =>
        setState((s) => (s.analyzed.includes(id) ? s : { ...s, analyzed: [...s.analyzed, id] })),
      toggleCompare: (id) =>
        setState((s) => ({
          ...s,
          compare: s.compare.includes(id)
            ? s.compare.filter((x) => x !== id)
            : s.compare.length >= 3
              ? [...s.compare.slice(1), id]
              : [...s.compare, id],
        })),
      clearCompare: () => setState((s) => ({ ...s, compare: [] })),
      createWorkspace: (id) =>
        setState((s) => {
          if (s.workspaces[id]) return s;
          const t = opportunityById(id);
          if (!t) return s;
          return { ...s, workspaces: { ...s.workspaces, [id]: newWorkspace(t) } };
        }),
      workspaceFor: (id) => state.workspaces[id],
      updateWorkspace,
      setChecklistStatus: (id, itemId, status) =>
        updateWorkspace(id, (w) => ({
          ...w,
          checklist: w.checklist.map((c) => (c.id === itemId ? { ...c, status } : c)),
        })),
      setChecklistNote: (id, itemId, note) =>
        updateWorkspace(id, (w) => ({
          ...w,
          checklist: w.checklist.map((c) => (c.id === itemId ? { ...c, note } : c)),
        })),
      toggleDoc: (id, docId) =>
        updateWorkspace(id, (w) => ({
          ...w,
          documents: w.documents.map((d) => (d.id === docId ? { ...d, attached: !d.attached } : d)),
        })),
      addClarification: (id, question) =>
        updateWorkspace(id, (w) => ({
          ...w,
          clarifications: [
            ...w.clarifications,
            { id: crypto.randomUUID(), question, asked: false, createdAt: new Date().toISOString() },
          ],
        })),
      setNotes: (id, notes) => updateWorkspace(id, (w) => ({ ...w, notes })),
      setReady: (id, ready) => updateWorkspace(id, (w) => ({ ...w, readyForSubmission: ready })),
      readiness: (id) => {
        const w = state.workspaces[id];
        if (!w) return 0;
        const applicable = w.checklist.filter((c) => c.status !== "not_applicable");
        const done = applicable.filter((c) => c.status === "complete").length;
        const docs = w.documents.filter((d) => d.required);
        const docsDone = docs.filter((d) => d.attached).length;
        const total = applicable.length + docs.length;
        if (total === 0) return 0;
        return Math.round(((done + docsDone) / total) * 100);
      },
    };
  }, [state, log]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}

export function useOpportunities(): EnrichedTender[] {
  return OPPORTUNITIES;
}
